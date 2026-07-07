import crypto from 'crypto';
import { XMLParser } from 'fast-xml-parser';
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
        return new NextResponse(
            `zip=no
file_limit=2000000`,
        );
    }

    return NextResponse.json({ error: 'not allowed' }, { status: 403 });
}

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');

    const filename = url.searchParams.get('filename') || 'import.xml';

    const dir = path.join(process.cwd(), '1c_uploads');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, filename);

    if (mode === 'file') {
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
    const xml = fs.readFileSync(filePath, 'utf8');
    if (!xml || xml.length < 10) throw new Error('empty xml');

    const parsed = parseOffersXml(xml);
  // удаляем XML сразу после парсинга — больше не нужен
    fs.unlinkSync(filePath);

    const basePath = filePath.replace(/\.xml$/i, '');
    const newPath = `${basePath}_new.json`;
    const oldPath = `${basePath}_old.json`;
    const diffPath = `${basePath}_diff.json`;

    writeFileSync(newPath, JSON.stringify(parsed, null, 2), 'utf8');

    let diff: ChangedParsedOffers[] = [];

    if (fs.existsSync(oldPath)) {
        const oldData = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
        let changedDetailed = getChangedDetailed(oldData, parsed);
        diff = await enrichNewProductsDiff(changedDetailed, parsed);
        writeFileSync(diffPath, JSON.stringify(diff, null, 2), 'utf8');
        fs.unlinkSync(oldPath);
    } else {
        diff = parsed.map((item) => ({ id: item.id, type: 'new' as ChangedOfferType }));
        writeFileSync(diffPath, JSON.stringify(diff, null, 2), 'utf8');
    }

    await syncProductsFromDiff(diff);

    fs.renameSync(newPath, oldPath);
}

// пайплан не работает. верно определяет айдишники но не видоизменяет.

// file chunk, size will be: 3581220
//  POST /api/1c-exchange?mode=file 200 in 349ms
// === SYNC PRODUCTS START ===
// ⚠ not found for update: 000009028
// ⚠ not found for update: 000009077
// ⚠ not found for update: 000009079
// ⚠ not found for update: 000009084
// ⚠ not found for delete: 000009085
// === SYNC DONE ===
//  POST /api/1c-exchange?mode=import 200 in 712ms