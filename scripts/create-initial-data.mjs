// node ./scripts/create-initial-data.mjs

import { exit } from 'process';
import { appendFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
const envFile = '.env.production';
config({ path: path.resolve(__dirname, '../', envFile) });

const CATEGORIES_LIST = [
    '3D стикер',
    'Акриловый значок',
    'Аксессуар',
    'Билет',
    'Блок для заметок',
    'Блокнот',
    'Браслет',
    'Брелки парные',
    'Брелок',
    'Брелок-конфета',
    'Брелок-кучеряшка',
    'Брелок-пищалка',
    'Брелок-шейкер',
    'Брошь',
    'Гача',
    'Гирлянда',
    'Зажигалка',
    'Закладка',
    'Заколка',
    'Зеркало',
    'Зин',
    'Значок',
    'Игрушка',
    'Календарь',
    'Карта',
    'Карточки',
    'Картхолдер',
    'Коврик для мыши',
    'Колье',
    'Кольцо',
    'Комикс',
    'Кошелек',
    'Кружка',
    'Кубарики',
    'Лайтбук',
    'Лента',
    'Линогравюра',
    'Ловец солнца',
    'Ловец радуги',
    'Магнит',
    'Магнитик',
    'Моносерьга',
    'Набор значков',
    'Набор принтов',
    'Набор стикеров',
    'Наклейка на карту',
    'Нашивка',
    'Носочки',
    'Обложка на паспорт',
    'Обложка на студенческий',
    'Открытка',
    'Пенал',
    'Переводное тату',
    'Переливашка',
    'Пиала',
    'Пин',
    'Плакат',
    'Плюшевый брелок',
    'Плюшевый брелок-конфета',
    'Повязка на голову',
    'Подвес',
    'Подвеска',
    'Подсвечник',
    'Постер',
    'Прочее',
    'Принт',
    'Своп карта',
    'Секретный конверт',
    'Сережки',
    'Сквиш',
    'Скетчбук',
    'Скотч',
    'Соусник',
    'Стенд',
    'Стикер',
    'Стикерпак',
    'Стикеры парные',
    'СТМ',
    'Тарелка',
    'Фигурка',
    'Футболка',
    'Холст',
    'Шкатулка',
    'Шоппер',
];

const CONFIG = {
    filePath: path.join(__dirname, process.env.EXCEL_FILE_PATH),
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    adminCredentials: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
    },
    credsFile: path.join(__dirname, process.env.CREDS_LOG_PATH),
    productsLogFile: path.join(__dirname, 'products-import-log.txt'),
    fallbackUser: {
        fullName: process.env.FALLBACK_USER_NAME,
        email: process.env.FALLBACK_USER_EMAIL,
    },
    colors: {
        reset: '\x1b[0m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        red: '\x1b[31m',
        cyan: '\x1b[36m',
    },
};

const stats = {
    users: {
        created: 0,
        existing: 0,
        failed: 0,
    },
    authors: {
        created: 0,
        updated: 0,
        existing: 0,
        failed: 0,
    },
    products: {
        created: 0,
        skipped: 0,
        failed: 0,
        existing: 0,
    },
};

let sessionCookie = null;
const authorCache = new Map();
const categoryCache = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generatePassword = () => Math.random().toString(36).slice(-10) + 'A1!';

const STATUS_LABELS = {
    created: 'УСПЕШНО СОЗДАН',
    existing: 'УЖЕ СУЩЕСТВУЕТ',
    skipped: 'ПРОПУЩЕН',
    failed: 'ОШИБКА',
};

function logProductLine({ authorName, title, article, quantity, status, details = '' }) {
    const statusLabel = STATUS_LABELS[status] || status.toUpperCase();
    const line =
        `[${new Date().toLocaleString()}] Автор: ${authorName || '—'} | ` +
        `Товар: ${title || '—'} | Артикул: ${article || '—'} | Кол-во: ${quantity ?? '—'} | ` +
        `Статус: ${statusLabel}${details ? ` (${details})` : ''}\n`;

    appendFileSync(CONFIG.productsLogFile, line);
}

async function request(method, path, body = null, retries = 3) {
    const headers = { 'Content-Type': 'application/json' };
    if (sessionCookie) headers['Cookie'] = sessionCookie;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(`${CONFIG.baseUrl}${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const setCookie = res.headers.getSetCookie?.() || [res.headers.get('set-cookie')];
            const token = setCookie.find((c) => c?.includes('payload-token'));
            if (token) sessionCookie = token.split(';')[0];

            let data = {};
            try {
                data = await res.json();
            } catch {
                data = { text: await res.text() };
            }
            return { status: res.status, data };
        } catch (e) {
            if (attempt < retries) {
                console.log(
                    `  ${CONFIG.colors.yellow}⟳ Попытка ${attempt}/${retries} не удалась, повтор через 2с...${CONFIG.colors.reset}`,
                );
                await sleep(2000);
            } else {
                return { status: 0, data: { error: e.message } };
            }
        }
    }
}

async function seedCategories() {
    console.log(`${CONFIG.colors.cyan}=== ЗАПУСК СКРИПТА ИМПОРТА КАТЕГОРИЙ ===${CONFIG.colors.reset}\n`);

    console.log(`[1/2] Авторизация админа (${CONFIG.adminCredentials.email})...`);
    const adminLogin = await request('POST', '/api/users/login', CONFIG.adminCredentials);

    if (adminLogin.status !== 200) {
        console.error(`${CONFIG.colors.red}Ошибка входа: ${JSON.stringify(adminLogin.data)}${CONFIG.colors.reset}`);
        return;
    }
    console.log(`${CONFIG.colors.green}  [+] Сессия получена${CONFIG.colors.reset}\n`);

    console.log(`[2/2] Создание категорий (${CATEGORIES_LIST.length} шт.)...`);

    let createdCount = 0;
    let errorCount = 0;

    for (const categoryLabel of CATEGORIES_LIST) {
        const payload = { label: categoryLabel };

        const res = await request('POST', '/api/categories', payload);
        //await sleep(100); // задержка между запросами

        if (res.status === 201) {
            console.log(`  ${CONFIG.colors.green}✔${CONFIG.colors.reset} ${categoryLabel}`);
            createdCount++;
        } else if (res.status === 400) {
            // Дубль — уже существует, не считаем за ошибку
            console.log(`  ${CONFIG.colors.yellow}~${CONFIG.colors.reset} ${categoryLabel} (уже существует)`);
        } else {
            const errorMsg = res.data.errors?.[0]?.message || res.data.error || 'Ошибка';
            console.log(`  ${CONFIG.colors.red}✘${CONFIG.colors.reset} ${categoryLabel} (${res.status}: ${errorMsg})`);
            errorCount++;
        }
    }

    console.log(`\n${CONFIG.colors.cyan}=== ИТОГИ КАТЕГОРИЙ ===${CONFIG.colors.reset}`);
    console.log(`Создано: ${CONFIG.colors.green}${createdCount}${CONFIG.colors.reset}`);
    console.log(`Ошибок: ${CONFIG.colors.red}${errorCount}${CONFIG.colors.reset}`);
}

async function getCategoryId(label) {
    if (!label) return null;
    const cleanLabel = label.trim();
    if (categoryCache.has(cleanLabel)) return categoryCache.get(cleanLabel);

    const res = await request('GET', `/api/categories?where[label][equals]=${encodeURIComponent(cleanLabel)}`);
    //await sleep(100);
    if (res.status === 200 && res.data.docs?.length > 0) {
        const id = res.data.docs[0].id;
        categoryCache.set(cleanLabel, id);
        return id;
    }
    return null;
}

async function createProduct(row, authorId, authorName) {
    const nomenclatureLink = row[9]?.toString() || '';
    const retailPrice = parseFloat(row[6]) || 0;
    const nomenclatureCode = row[8]?.toString() || '';
    const stockBalance = parseInt(row[10]) || 0;
    const parts = nomenclatureLink.split(',').map((s) => s?.trim());
    const title = parts[0] || 'Без названия';
    const categoryLabel = parts[parts.length - 1];

    const logBase = { authorName, title, article: nomenclatureCode, quantity: stockBalance };

    if (categoryLabel === 'Услуги') {
        logProductLine({ ...logBase, status: 'skipped', details: 'категория "Услуги"' });
        return 'skipped';
    }

    const categoryId = await getCategoryId(categoryLabel);

    const productData = {
        title,
        price: retailPrice,
        article1C: nomenclatureCode,
        quantity: stockBalance,
        author: authorId,
        category: categoryId,
    };

    if (nomenclatureCode) {
        const existing = await request(
            'GET',
            `/api/products?where[article1C][equals]=${encodeURIComponent(nomenclatureCode)}`,
        );
        if (existing.status === 200 && existing.data.docs?.length > 0) {
            logProductLine({ ...logBase, status: 'existing' });
            return 'existing';
        }
    }

    const res = await request('POST', '/api/products', productData);
    //await sleep(100); // задержка между запросами
    if (res.status === 201) {
        console.log(`${CONFIG.colors.green}  ✔ Товар: ${title}${CONFIG.colors.reset}`);
        logProductLine({ ...logBase, status: 'created' });
        return 'created';
    }

    const errorMsg = res.data?.errors?.[0]?.message || res.data?.error || `HTTP ${res.status}`;
    console.log(`${CONFIG.colors.red}  ✘ Ошибка товара "${title}": ${res.status}${CONFIG.colors.reset}`);
    logProductLine({ ...logBase, status: 'failed', details: errorMsg });

    return 'failed';
}

async function runSeed() {
    console.log(`${CONFIG.colors.cyan}=== ЗАПУСК ИМПОРТА ===${CONFIG.colors.reset}\n`);

    const login = await request('POST', '/api/users/login', CONFIG.adminCredentials);
    if (login.status !== 200) {
        console.error(`${CONFIG.colors.red}Ошибка входа админа!${CONFIG.colors.reset}`);
        return;
    }

    const workbook = XLSX.readFile(CONFIG.filePath);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

    writeFileSync(CONFIG.credsFile, `Лог импорта от ${new Date().toLocaleString()}\n\n`);
    writeFileSync(CONFIG.productsLogFile, `Лог импорта товаров от ${new Date().toLocaleString()}\n\n`);

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[7]) continue;

        const serialNumber = row[3]?.toString().trim();
        const supplierInfo = row[7].toString();
        let [fullName, email] = supplierInfo.split(',').map((s) => s?.trim());

        if (!fullName || fullName === '') {
            fullName = CONFIG.fallbackUser.fullName;
            email = CONFIG.fallbackUser.email;
        }

        if (authorCache.has(fullName)) {
            const result = await createProduct(row, authorCache.get(fullName), fullName);

            if (result === 'created') stats.products.created++;
            else if (result === 'failed') stats.products.failed++;
            else if (result === 'skipped') stats.products.skipped++;
            continue;
        }

        const findAuthor = await request('GET', `/api/authors?where[fullName][equals]=${encodeURIComponent(fullName)}`);
        //await sleep(100);

        if (findAuthor.status === 200 && findAuthor.data.docs?.length > 0) {
            const authorId = findAuthor.data.docs[0].id;
            authorCache.set(fullName, authorId);
            console.log(`${CONFIG.colors.yellow}Автор уже существует: ${fullName}${CONFIG.colors.reset}`);
            stats.authors.existing++;
            const result = await createProduct(row, authorId, fullName);

            if (result === 'created') stats.products.created++;
            else if (result === 'failed') stats.products.failed++;
            else if (result === 'skipped') stats.products.skipped++;
            continue;
        }

        if (!email) {
            const safeName = Buffer.from(fullName).toString('hex').slice(0, 8);
            email = `user_${safeName}@minto-store.ru`;
        }

        const findUser = await request('GET', `/api/users?where[email][equals]=${encodeURIComponent(email)}`);
        //await sleep(100);
        let userId = null;

        if (findUser.status === 200 && findUser.data.docs?.length > 0) {
            userId = findUser.data.docs[0].id;
            console.log(`${CONFIG.colors.yellow}Пользователь найден: ${email}${CONFIG.colors.reset}`);
            stats.users.existing++;
        } else {
            const password = generatePassword();
            const newUser = await request('POST', '/api/users', {
                email,
                password,
                fullName,
                role: 'author',
            });
            ////await sleep(100);

            if (newUser.status === 201) {
                userId = newUser.data.doc.id;
                appendFileSync(CONFIG.credsFile, `ФИО: ${fullName} | Email: ${email} | Pass: ${password}\n`);
                console.log(`${CONFIG.colors.green}Создан пользователь: ${email}${CONFIG.colors.reset}`);
                stats.users.created++;
            } else {
                console.log(
                    `${CONFIG.colors.red}Ошибка создания пользователя ${email}: ${newUser.status}${CONFIG.colors.reset}`,
                );
                stats.users.failed++;
                continue;
            }
        }

        if (userId) {
            const autoAuthorRes = await request('GET', `/api/authors?where[user][equals]=${userId}`);
            //await sleep(100);

            if (autoAuthorRes.status === 200 && autoAuthorRes.data.docs?.length > 0) {
                const authorId = autoAuthorRes.data.docs[0].id;

                const updateRes = await request('PATCH', `/api/authors/${authorId}`, {
                    name: serialNumber || fullName,
                    fullName: fullName,
                });
                //await sleep(100);

                if (updateRes.status === 200) {
                    authorCache.set(fullName, authorId);
                    console.log(`${CONFIG.colors.green}[~] Данные автора заполнены: ${fullName}${CONFIG.colors.reset}`);
                    stats.authors.updated++;
                    const result = await createProduct(row, authorId, fullName);

                    if (result === 'created') stats.products.created++;
                    else if (result === 'failed') stats.products.failed++;
                    else if (result === 'skipped') stats.products.skipped++;
                } else {
                    console.log(
                        `${CONFIG.colors.red}Ошибка обновления автора ${authorId}: ${updateRes.status}${CONFIG.colors.reset}`,
                    );
                    stats.authors.failed++;
                }
            } else {
                const manualAuthor = await request('POST', '/api/authors', {
                    name: serialNumber || fullName,
                    fullName: fullName,
                    user: userId,
                });
                // await sleep(100);

                if (manualAuthor.status === 201) {
                    const authorId = manualAuthor.data.doc.id;
                    authorCache.set(fullName, authorId);
                    console.log(`${CONFIG.colors.cyan}[+] Автор создан вручную: ${fullName}${CONFIG.colors.reset}`);
                    stats.authors.created++;
                    const result = await createProduct(row, authorId, fullName);

                    if (result === 'created') stats.products.created++;
                    else if (result === 'failed') stats.products.failed++;
                    else if (result === 'skipped') stats.products.skipped++;
                }
            }
        }
    }
    console.log(`\n${CONFIG.colors.cyan}=== ИМПОРТ ЗАВЕРШЕН ===${CONFIG.colors.reset}`);

    console.log(`\n${CONFIG.colors.cyan}=== СТАТИСТИКА ===${CONFIG.colors.reset}`);

    console.log(`\nПользователи:`);
    console.log(`  Создано:        ${CONFIG.colors.green}${stats.users.created}${CONFIG.colors.reset}`);
    console.log(`  Уже существовало:${CONFIG.colors.yellow}${stats.users.existing}${CONFIG.colors.reset}`);
    console.log(`  Ошибок:         ${CONFIG.colors.red}${stats.users.failed}${CONFIG.colors.reset}`);

    console.log(`\nАвторы:`);
    console.log(`  Создано:        ${CONFIG.colors.green}${stats.authors.created}${CONFIG.colors.reset}`);
    console.log(`  Обновлено:      ${CONFIG.colors.cyan}${stats.authors.updated}${CONFIG.colors.reset}`);
    console.log(`  Уже существовало:${CONFIG.colors.yellow}${stats.authors.existing}${CONFIG.colors.reset}`);
    console.log(`  Ошибок:         ${CONFIG.colors.red}${stats.authors.failed}${CONFIG.colors.reset}`);

    console.log(`\nТовары:`);
    console.log(`  Создано:        ${CONFIG.colors.green}${stats.products.created}${CONFIG.colors.reset}`);
    console.log(`  Пропущено:      ${CONFIG.colors.yellow}${stats.products.skipped}${CONFIG.colors.reset}`);
    console.log(`  Уже существовало:${CONFIG.colors.yellow}${stats.products.existing}${CONFIG.colors.reset}`);
    console.log(`  Ошибок:         ${CONFIG.colors.red}${stats.products.failed}${CONFIG.colors.reset}`);

    console.log(`\n${CONFIG.colors.cyan}Подробный лог по товарам: ${CONFIG.productsLogFile}${CONFIG.colors.reset}`);
}

async function main() {
    await seedCategories();
    await runSeed();
    console.log('Готово!');
    exit(0);
}

main();
