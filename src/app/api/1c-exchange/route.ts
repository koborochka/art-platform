import crypto from 'crypto';
import fs, { createWriteStream, writeFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { enrichNewProductsDiff } from '@/shared/utils/enrichNewProductsDiff';
import {
    type ChangedOfferType,
    type ChangedParsedOffers,
    getChangedDetailed,
    type ParsedOffer,
    parseOffersXml,
} from '@/shared/utils/getChangedDetailed';
import { syncProductsFromDiff } from '@/shared/utils/syncProductsFromDiff';

const LOGIN = process.env.ONEC_LOGIN;
const PASSWORD = process.env.ONEC_PASSWORD;

function checkAuth(req: NextRequest) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) return false;
    if (!authHeader.startsWith('Basic ')) return false;

    const base64 = authHeader.split(' ')[1];
    if (!base64) return false;

    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [login, password] = decoded.split(':');

    return login === LOGIN && password === PASSWORD;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');
    console.log('GET mode = ' + mode);

    if (mode === 'checkauth') {
        if (!checkAuth(req)) {
            return new NextResponse('failure', { status: 401 });
        }

        const sessionId = crypto.randomBytes(16).toString('hex');

        const res = new NextResponse(
            `success
session
${sessionId}`,
        );

        res.cookies.set('session', sessionId, {
            httpOnly: true,
            path: '/',
        });

        return res;
    }

    if (mode === 'init') {
        const dir = path.join(process.cwd(), '1c_uploads');
        fs.readdirSync(dir)
            .filter((f) => f.toLowerCase().endsWith('.xml'))
            .forEach((f) => {
                console.log(`[init] removing stale xml from previous session: ${f}`);
                fs.unlinkSync(path.join(dir, f));
            });

        return new NextResponse(`zip=no\nfile_limit=2000000`);
    }

    if (mode === 'import') {
        const filename = url.searchParams.get('filename') || 'import.xml';
        const dir = path.join(process.cwd(), '1c_uploads');
        const filePath = path.join(dir, filename);

        console.log(`[GET import] filename=${filename}`);

        await runImport(filePath);
        return new NextResponse('success');
    }

    return NextResponse.json({ error: 'not allowed' }, { status: 403 });
}

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');

    const filename = url.searchParams.get('filename') || 'import.xml';

    const dir = path.join(process.cwd(), '1c_uploads');

    console.log('POST mode = ' + mode + ' filename=' + path.join(dir, filename));

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, filename);

    if (mode === 'file') {
        console.log('[file headers]', JSON.stringify(Object.fromEntries(req.headers.entries())));
        console.log('file chunk, size will be:', req.headers.get('content-length'));

        const writeStream = createWriteStream(filePath, {
            flags: 'a',
        });
        await pipeline(req.body as unknown as Readable, writeStream);

        return new NextResponse('success');
    }

    if (mode === 'import') {
        await runImport(path.join(dir, filename));
        return new NextResponse('success');
    }

    return NextResponse.json({ error: 'unknown mode' }, { status: 400 });
}

async function runImport(filePath: string) {
    console.log(`[import] start, file=${filePath}`);
    const startTs = Date.now();

    const xml = fs.readFileSync(filePath, 'utf8');
    console.log(`[import] read xml, size=${xml.length} bytes`);

    if (!xml || xml.length < 10) {
        console.error(`[import] xml is empty or too small (len=${xml.length}), aborting`);
        throw new Error('empty xml');
    }

    let parsed: ParsedOffer[];
    try {
        parsed = parseOffersXml(xml);
        console.log(`[import] parsed xml -> ${parsed.length} offers`);
    } catch (e) {
        console.error(`[import] failed to parse xml, deleting file`, e);
        fs.unlinkSync(filePath); // не оставляем битый файл на следующую сессию
        throw e;
    }

    // удаляем XML сразу после парсинга — больше не нужен
    fs.unlinkSync(filePath);
    console.log(`[import] deleted source xml file`);

    const basePath = filePath.replace(/\.xml$/i, '');
    const newPath = `${basePath}_new.json`;
    const oldPath = `${basePath}_old.json`;
    const diffPath = `${basePath}_diff.json`;

    writeFileSync(newPath, JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`[import] wrote new snapshot -> ${newPath}`);

    let diff: ChangedParsedOffers[] = [];

    if (fs.existsSync(oldPath)) {
        console.log(`[import] found previous snapshot -> ${oldPath}, computing diff`);
        const oldData = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
        console.log(`[import] loaded old snapshot, ${oldData.length} offers`);

        const changedDetailed = getChangedDetailed(oldData, parsed);
        console.log(`[import] detected ${changedDetailed.length} changed offers`);

        diff = await enrichNewProductsDiff(changedDetailed, parsed);
        console.log(`[import] enriched diff -> ${diff.length} entries`);
    } else {
        console.log(`[import] no previous snapshot found, treating all ${parsed.length} offers as new`);
        diff = parsed.map((item) => ({ id: item.id, type: 'new' as ChangedOfferType }));
    }

    writeFileSync(diffPath, JSON.stringify(diff, null, 2), 'utf8');
    console.log(`[import] wrote diff -> ${diffPath}`);

    console.log(`[import] syncing ${diff.length} products from diff...`);
    await syncProductsFromDiff(diff);
    console.log(`[import] sync done`);

    fs.renameSync(newPath, oldPath);
    console.log(`[import] rotated snapshot: ${newPath} -> ${oldPath}`);

    console.log(`[import] finished in ${Date.now() - startTs}ms`);
}
