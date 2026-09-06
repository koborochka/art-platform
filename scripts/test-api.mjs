import { exit } from 'process';

const CONFIG = {
    baseUrl: 'http://localhost:3000',
    colors: {
        reset: '\x1b[0m',
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        magenta: '\x1b[35m',
        dim: '\x1b[2m',
    },
};

const sessions = { hacker: null, victim: null, public: null, admin: null };

async function request(role, method, path, body = null, customHeaders = {}) {
    const headers = { 'Content-Type': 'application/json', ...customHeaders };

    if (role !== 'public' && sessions[role]) {
        headers['Cookie'] = sessions[role];
    }

    try {
        const res = await fetch(`${CONFIG.baseUrl}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        let cookies = [];
        // Используем getSetCookie если доступно, иначе парсим заголовок
        if (typeof res.headers.getSetCookie === 'function') {
            cookies = res.headers.getSetCookie();
        } else {
            const c = res.headers.get('set-cookie');
            if (c) cookies = [c];
        }

        const tokenCookie = cookies.find((c) => c.includes('payload-token')) || cookies[0];
        if (tokenCookie && role !== 'public') {
            sessions[role] = tokenCookie.split(';')[0];
        }

        let data = {};
        try {
            data = await res.json();
        } catch {
            data = { text: await res.text() };
        }

        return { status: res.status, data };
    } catch (e) {
        console.error(`${CONFIG.colors.red}Network Error: ${e.message}${CONFIG.colors.reset}`);
        return { status: 0, data: {} };
    }
}

function check(operation, result, expected, role) {
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    const passed = expectedArray.includes(result.status);
    const roleColor =
        role === 'hacker'
            ? CONFIG.colors.red
            : role === 'public'
              ? CONFIG.colors.cyan
              : role === 'admin'
                ? CONFIG.colors.magenta
                : CONFIG.colors.green;

    const statusColor = passed ? CONFIG.colors.green : CONFIG.colors.red;

    if (passed) {
        console.log(
            `  ${roleColor}[${role.toUpperCase()}]${CONFIG.colors.reset} ${operation} -> ${statusColor}Pass (${result.status})${CONFIG.colors.reset}`,
        );
    } else {
        console.log(
            `  ${roleColor}[${role.toUpperCase()}]${CONFIG.colors.reset} ${operation} -> ${statusColor}FAIL${CONFIG.colors.reset}`,
        );
        console.log(`      Expected: ${expectedArray.join('/')}, Got: ${result.status}`);
        if (result.data && Object.keys(result.data).length > 0) {
            const strData = JSON.stringify(result.data);
            console.log(`      Response: ${strData.length > 100 ? strData.slice(0, 100) + '...' : strData}`);
        }
    }
}

async function registerAndLogin(role, userData) {
    const resReg = await request(role, 'POST', '/api/auth/register', userData);
    if (resReg.status === 200 || resReg.status === 201 || resReg.status === 400) {
        return await request(role, 'POST', '/api/users/login', { email: userData.email, password: userData.password });
    }
    return resReg;
}

async function createAuthor(role, authorData) {
    return await request(role, 'POST', '/api/authors', authorData);
}

async function createForm(role, formData) {
    return await request(role, 'POST', '/api/forms', formData);
}

async function createProduct(role, productData) {
    return await request(role, 'POST', '/api/products', productData);
}

async function createOrder(role, orderData) {
    return await request(role, 'POST', '/api/orders', orderData);
}

async function createCart(role, cartData) {
    return await request(role, 'POST', '/api/carts', cartData);
}

const timestamp = Date.now();
const VICTIM = {
    email: `victim_${timestamp}@test.com`,
    password: 'HardPassword123',
    fullName: 'Victim User',
    phone: '0987654321',
};
const HACKER = {
    email: `hacker_${timestamp}@test.com`,
    password: 'VeryHardPassword123',
    fullName: 'Hacker User',
    phone: '1234567890',
};
const ADMIN = {
    email: `admin_${timestamp}@test.com`,
    password: 'adminPassword123',
    fullName: 'Admin User',
    phone: '1111111111',
};

async function runFullAudit() {
    console.log(`${CONFIG.colors.blue}=== COMPLETE CRUD & SECURITY AUDIT ===${CONFIG.colors.reset}\n`);

    console.log(`${CONFIG.colors.yellow}--- 1. Initialization ---${CONFIG.colors.reset}`);

    // Register users
    await registerAndLogin('hacker', HACKER);
    await registerAndLogin('victim', VICTIM);

    // Register admin (first user becomes admin automatically)
    const adminReg = await request('admin', 'POST', '/api/auth/register', ADMIN);
    if (adminReg.status === 200 || adminReg.status === 201 || adminReg.status === 400) {
        await request('admin', 'POST', '/api/users/login', { email: ADMIN.email, password: ADMIN.password });
    }

    let victimUserId = null;
    let victimCustomerId = null;
    let victimAuthorId = null;
    let hackerUserId = null;
    let hackerCustomerId = null;
    let hackerAuthorId = null;
    let adminUserId = null;
    let productId = null;
    let mediaId = null;
    let cartId = null;
    let orderId = null;
    let formId = null;
    let authorProductId = null;

    // Get Hacker IDs
    const resMeH = await request('hacker', 'GET', '/api/users/me');
    if (resMeH.status === 200) {
        hackerUserId = resMeH.data.user.id;
        const resCust = await request('hacker', 'GET', `/api/customers?where[user][equals]=${hackerUserId}`);
        if (resCust.data?.docs?.[0]) hackerCustomerId = resCust.data.docs[0].id;

        const resAuthor = await request('hacker', 'GET', `/api/authors?where[user][equals]=${hackerUserId}`);
        if (resAuthor.data?.docs?.[0]) hackerAuthorId = resAuthor.data.docs[0].id;
    }

    // Get Victim IDs
    const resMeV = await request('victim', 'GET', '/api/users/me');
    if (resMeV.status === 200) {
        victimUserId = resMeV.data.user.id;
        const resCust = await request('victim', 'GET', `/api/customers?where[user][equals]=${victimUserId}`);
        if (resCust.data?.docs?.[0]) victimCustomerId = resCust.data.docs[0].id;

        const resAuthor = await request('victim', 'GET', `/api/authors?where[user][equals]=${victimUserId}`);
        if (resAuthor.data?.docs?.[0]) victimAuthorId = resAuthor.data.docs[0].id;
    }

    // Get Admin IDs
    const resMeA = await request('admin', 'GET', '/api/users/me');
    if (resMeA.status === 200) {
        adminUserId = resMeA.data.user.id;
    }

    // Get existing data
    const resProd = await request('public', 'GET', '/api/products');
    if (resProd.status === 200 && resProd.data.docs.length > 0) {
        productId = resProd.data.docs[0].id;
        console.log(`  ${CONFIG.colors.dim}Found product ID: ${productId}${CONFIG.colors.reset}`);

        // Check if product has author
        const productRes = await request('public', 'GET', `/api/products/${productId}`);
        if (productRes.status === 200 && productRes.data.author) {
            authorProductId = productRes.data.author.id || productRes.data.author;
        }
    }

    const resMedia = await request('public', 'GET', '/api/media');
    if (resMedia.status === 200 && resMedia.data.docs.length > 0) {
        mediaId = resMedia.data.docs[0].id;
        console.log(`  ${CONFIG.colors.dim}Found media ID: ${mediaId}${CONFIG.colors.reset}`);
    }

    // Create test form as admin to test access
    const formRes = await createForm('admin', { content: 'Test form content' });
    if (formRes.status === 201 || formRes.status === 200) {
        formId = formRes.data.doc?.id;
        console.log(`  ${CONFIG.colors.dim}Created form ID: ${formId}${CONFIG.colors.reset}`);
    }

    console.log(
        `  ${CONFIG.colors.dim}Hacker: U=${hackerUserId}/C=${hackerCustomerId}/A=${hackerAuthorId} | Victim: U=${victimUserId}/C=${victimCustomerId}/A=${victimAuthorId} | Admin: U=${adminUserId}${CONFIG.colors.reset}\n`,
    );

    console.log(`${CONFIG.colors.yellow}--- 2. USERS Collection ---${CONFIG.colors.reset}`);

    check('Read Users List - Public', await request('public', 'GET', '/api/users'), [401, 403], 'public');

    const resUserListH = await request('hacker', 'GET', '/api/users');
    if (resUserListH.status === 200) {
        console.log(
            `  ${CONFIG.colors.red}[HACKER]${CONFIG.colors.reset} Read Users List -> ${CONFIG.colors.green}Pass (Status 200)${CONFIG.colors.reset}`,
        );
    } else {
        check('Read Users List - Hacker', resUserListH, [200, 403], 'hacker');
    }

    if (victimUserId) {
        check(
            'Update Victim User',
            await request('hacker', 'PATCH', `/api/users/${victimUserId}`, { email: 'hacked@test.com' }),
            [401, 403, 404],
            'hacker',
        );
        check(
            'Delete Victim User',
            await request('hacker', 'DELETE', `/api/users/${victimUserId}`),
            [401, 403, 404],
            'hacker',
        );
    }

    if (hackerUserId) {
        check(
            'Update Own User',
            await request('hacker', 'PATCH', `/api/users/${hackerUserId}`, { email: `updated_${timestamp}@test.com` }),
            [200, 400, 401, 403],
            'hacker',
        );
    }

    console.log(`${CONFIG.colors.yellow}--- 3. CUSTOMERS Collection ---${CONFIG.colors.reset}`);

    check(
        'Create Customer - Manual',
        await request('hacker', 'POST', '/api/customers', {
            fullName: 'Manual Customer',
            email: 'test@test.com',
            user: hackerUserId,
        }),
        [401, 403],
        'hacker',
    );

    if (hackerCustomerId) {
        check('Read Own Customer', await request('hacker', 'GET', `/api/customers/${hackerCustomerId}`), 200, 'hacker');
        check(
            'Update Own Customer',
            await request('hacker', 'PATCH', `/api/customers/${hackerCustomerId}`, { fullName: 'Updated Hacker' }),
            200,
            'hacker',
        );
    }

    if (victimCustomerId) {
        check(
            'Read Victim Customer',
            await request('hacker', 'GET', `/api/customers/${victimCustomerId}`),
            [401, 403, 404],
            'hacker',
        );
        check(
            'Update Victim Customer',
            await request('hacker', 'PATCH', `/api/customers/${victimCustomerId}`, { fullName: 'Hacked Name' }),
            [401, 403, 404],
            'hacker',
        );
        check(
            'Delete Victim Customer',
            await request('hacker', 'DELETE', `/api/customers/${victimCustomerId}`),
            [401, 403, 404],
            'hacker',
        );
    }

    console.log(`${CONFIG.colors.yellow}--- 4. AUTHORS Collection ---${CONFIG.colors.reset}`);

    // Публичный доступ разрешен - профили авторов доступны всем
    check('Read Authors List - Public', await request('public', 'GET', '/api/authors'), 200, 'public');

    // Публичный пользователь не может создавать авторов
    check(
        'Create Author - Public',
        await createAuthor('public', { name: 'Public Author', bio: 'Test bio' }),
        [401, 403],
        'public',
    );

    // Покупатель (хакер) не может создавать авторов
    check(
        'Create Author - Hacker',
        await createAuthor('hacker', { name: 'Hacker Author', bio: 'Test bio', user: hackerUserId }),
        [401, 403],
        'hacker',
    );

    // Покупатель может видеть список авторов (публичный доступ)
    check('Read Authors List - Hacker', await request('hacker', 'GET', '/api/authors'), 200, 'hacker');

    // Покупатель может видеть конкретного автора
    if (victimAuthorId) {
        check(
            'Read Victim Author - Hacker',
            await request('hacker', 'GET', `/api/authors/${victimAuthorId}`),
            200,
            'hacker',
        );
    }

    // Покупатель не может обновлять или удалять авторов (даже если видит их)
    if (victimAuthorId) {
        check(
            'Update Victim Author',
            await request('hacker', 'PATCH', `/api/authors/${victimAuthorId}`, { bio: 'Hacked bio' }),
            [401, 403],
            'hacker',
        );
        check(
            'Delete Victim Author',
            await request('hacker', 'DELETE', `/api/authors/${victimAuthorId}`),
            [401, 403, 404],
            'hacker',
        );
    }

    console.log(`${CONFIG.colors.yellow}--- 5. CARTS Collection ---${CONFIG.colors.reset}`);

    check(
        'Create Cart - Public',
        await createCart('public', { owner: victimCustomerId, items: [] }),
        [401, 403],
        'public',
    );
    check(
        'Create Cart - Hacker',
        await createCart('hacker', { owner: hackerCustomerId, items: [] }),
        [401, 403],
        'hacker',
    );

    const hackerCartRes = await request('hacker', 'GET', '/api/carts');
    if (hackerCartRes.status === 200 && hackerCartRes.data.docs?.length > 0) {
        cartId = hackerCartRes.data.docs[0].id;
        check('Read Own Cart', await request('hacker', 'GET', `/api/carts/${cartId}`), 200, 'hacker');

        if (productId) {
            check(
                'Update Own Cart',
                await request('hacker', 'PATCH', `/api/carts/${cartId}`, {
                    items: [{ product: productId, quantity: 2, checked: true }],
                }),
                200,
                'hacker',
            );
        }
    } else {
        check('Read Carts List - Hacker', hackerCartRes, [200, 404], 'hacker');
    }

    check(
        'Delete Cart - Hacker',
        await request('hacker', 'DELETE', `/api/carts/${cartId || '999'}`),
        [401, 403, 404],
        'hacker',
    );

    console.log(`${CONFIG.colors.yellow}--- 6. PRODUCTS Collection ---${CONFIG.colors.reset}`);

    check('Read Products List - Public', await request('public', 'GET', '/api/products'), 200, 'public');

    if (productId) {
        check(
            'Read Single Product - Public',
            await request('public', 'GET', `/api/products/${productId}`),
            200,
            'public',
        );
        check(
            'Update Product - Hacker',
            await request('hacker', 'PATCH', `/api/products/${productId}`, { price: 0 }),
            [401, 403],
            'hacker',
        );
        check(
            'Delete Product - Hacker',
            await request('hacker', 'DELETE', `/api/products/${productId}`),
            [401, 403],
            'hacker',
        );
    }

    check(
        'Create Product - Public',
        await createProduct('public', { title: 'Hack Product', price: 100, description: 'Test' }),
        [401, 403],
        'public',
    );
    check(
        'Create Product - Hacker',
        await createProduct('hacker', { title: 'Hacker Product', price: 200, description: 'Test' }),
        [401, 403],
        'hacker',
    );

    console.log(`${CONFIG.colors.yellow}--- 7. ORDERS Collection ---${CONFIG.colors.reset}`);

    check('Create Order - Public', await request('public', 'POST', '/api/orders', { items: [] }), [401, 403], 'public');

    if (productId && hackerCustomerId) {
        const orderBody = {
            items: [
                {
                    productSnapshot: {
                        productId: productId,
                        title: 'Test Product',
                        price: 100,
                    },
                    quantity: 1,
                },
            ],
            total: 100,
            customer: hackerCustomerId,
            deliveryType: 'pickup',
            status: 'processing',
        };

        const createOrderRes = await createOrder('hacker', orderBody);

        if (createOrderRes.status === 201 || createOrderRes.status === 200) {
            orderId = createOrderRes.data.doc?.id;
            console.log(
                `  ${CONFIG.colors.red}[HACKER]${CONFIG.colors.reset} Create Order -> ${CONFIG.colors.green}Pass (Created)${CONFIG.colors.reset}`,
            );

            // Покупатель может обновить статус заказа только если он в статусе "processing"
            check(
                'Update Own Order (cancel processing order)',
                await request('hacker', 'PATCH', `/api/orders/${orderId}`, { status: 'cancelled' }),
                [200, 403],
                'hacker',
            );

            // После отмены заказа, покупатель НЕ может снова изменить статус
            if (orderId) {
                check(
                    'Update Cancelled Order (should fail)',
                    await request('hacker', 'PATCH', `/api/orders/${orderId}`, { status: 'completed' }),
                    [401, 403],
                    'hacker',
                );
            }

            check('Read Own Order', await request('hacker', 'GET', `/api/orders/${orderId}`), 200, 'hacker');
            check(
                'Delete Order - Hacker',
                await request('hacker', 'DELETE', `/api/orders/${orderId}`),
                [401, 403],
                'hacker',
            );
        } else if (createOrderRes.status === 400) {
            console.log(
                `  ${CONFIG.colors.red}[HACKER]${CONFIG.colors.reset} Create Order -> ${CONFIG.colors.cyan}Pass (Validation Error, Access OK)${CONFIG.colors.reset}`,
            );
        } else {
            check('Create Order - Hacker', createOrderRes, [200, 201, 400], 'hacker');
        }
    }

    check('Read Orders List - Hacker', await request('hacker', 'GET', '/api/orders'), [200], 'hacker');

    // Создаем второй заказ для теста обновления не-processing заказа
    if (productId && hackerCustomerId && orderId) {
        const secondOrderBody = {
            items: [
                {
                    productSnapshot: {
                        productId: productId,
                        title: 'Second Product',
                        price: 150,
                    },
                    quantity: 2,
                },
            ],
            total: 300,
            customer: hackerCustomerId,
            deliveryType: 'delivery',
            status: 'processing',
        };

        const secondOrderRes = await createOrder('hacker', secondOrderBody);
        if (secondOrderRes.status === 201 || secondOrderRes.status === 200) {
            const secondOrderId = secondOrderRes.data.doc?.id;

            // Сначала отменяем заказ
            await request('hacker', 'PATCH', `/api/orders/${secondOrderId}`, { status: 'cancelled' });

            // Пытаемся изменить отмененный заказ (должно быть запрещено)
            check(
                'Update Already Cancelled Order',
                await request('hacker', 'PATCH', `/api/orders/${secondOrderId}`, { status: 'completed' }),
                [401, 403],
                'hacker',
            );
        }
    }

    console.log(`${CONFIG.colors.yellow}--- 8. FORMS Collection ---${CONFIG.colors.reset}`);

    check('Read Forms List - Public', await request('public', 'GET', '/api/forms'), [401, 403], 'public');
    check('Create Form - Public', await createForm('public', { content: 'Test form content' }), [401, 403], 'public');
    check('Create Form - Hacker', await createForm('hacker', { content: 'Hacker form content' }), [401, 403], 'hacker');

    if (formId) {
        check('Read Form - Public', await request('public', 'GET', `/api/forms/${formId}`), [401, 403], 'public');
        check('Read Form - Hacker', await request('hacker', 'GET', `/api/forms/${formId}`), [401, 403], 'hacker');
        check(
            'Update Form - Hacker',
            await request('hacker', 'PATCH', `/api/forms/${formId}`, { content: 'Updated' }),
            [401, 403],
            'hacker',
        );
        check('Delete Form - Hacker', await request('hacker', 'DELETE', `/api/forms/${formId}`), [401, 403], 'hacker');
    }

    console.log(`${CONFIG.colors.yellow}--- 9. MEDIA Collection ---${CONFIG.colors.reset}`);

    check('Read Media List - Public', await request('public', 'GET', '/api/media'), 200, 'public');

    if (mediaId) {
        check(
            'Read Single Media - Public',
            await request('public', 'GET', `/api/media/${mediaId}`),
            [200, 404],
            'public',
        );
        check(
            'Update Media - Hacker',
            await request('hacker', 'PATCH', `/api/media/${mediaId}`, { alt: 'Hacked' }),
            [401, 403],
            'hacker',
        );
        check(
            'Delete Media - Hacker',
            await request('hacker', 'DELETE', `/api/media/${mediaId}`),
            [401, 403, 404],
            'hacker',
        );
    }

    check(
        'Create Media - Hacker',
        await request('hacker', 'POST', '/api/media', { alt: 'Hack' }),
        [400, 401, 403],
        'hacker',
    );

    console.log(`\n${CONFIG.colors.blue}=== AUDIT COMPLETED ===${CONFIG.colors.reset}`);

    exit(0);
}

runFullAudit().catch((error) => {
    console.error(`${CONFIG.colors.red}Fatal error: ${error}${CONFIG.colors.reset}`);
    exit(1);
});

// TODO: добавить тесты на безопасность (код в полях ввода, к примеру, сейчас можно оставить)
