-- Удаляем старые функции и триггеры
DROP TRIGGER IF EXISTS products_update_count ON products;
DROP TRIGGER IF EXISTS products_update_categories ON products;
DROP FUNCTION IF EXISTS update_author_products_count();
DROP FUNCTION IF EXISTS update_author_product_categories();

-- 1. Подсчёт количества товаров у автора
CREATE OR REPLACE FUNCTION update_author_products_count()
RETURNS TRIGGER AS $$
DECLARE
    v_old_author integer;
    v_new_author integer;
BEGIN
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        v_new_author := NEW.author_id;
    END IF;
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        v_old_author := OLD.author_id;
    END IF;

    IF v_new_author IS NOT NULL THEN
        UPDATE authors
        SET products_count = (SELECT COUNT(*) FROM products WHERE author_id = v_new_author)
        WHERE id = v_new_author;
    END IF;

    IF v_old_author IS NOT NULL AND (v_new_author IS NULL OR v_old_author <> v_new_author) THEN
        UPDATE authors
        SET products_count = (SELECT COUNT(*) FROM products WHERE author_id = v_old_author)
        WHERE id = v_old_author;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Обновление категорий автора
CREATE OR REPLACE FUNCTION update_author_product_categories()
RETURNS TRIGGER AS $$
DECLARE
    v_old_author integer;
    v_new_author integer;
BEGIN
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        v_new_author := NEW.author_id;
    END IF;
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        v_old_author := OLD.author_id;
    END IF;

    IF v_new_author IS NOT NULL THEN
        DELETE FROM authors_product_categories WHERE _parent_id = v_new_author;

        INSERT INTO authors_product_categories (_parent_id, id, category, _order)
        SELECT v_new_author, gen_random_uuid()::text, cat_value,
               ROW_NUMBER() OVER (ORDER BY cat_value)
        FROM (
            SELECT DISTINCT c.value AS cat_value
            FROM products p
            JOIN categories c ON c.id = p.category_id
            WHERE p.author_id = v_new_author AND p.category_id IS NOT NULL
        ) AS unique_cats;
    END IF;

    IF v_old_author IS NOT NULL AND (v_new_author IS NULL OR v_old_author <> v_new_author) THEN
        DELETE FROM authors_product_categories WHERE _parent_id = v_old_author;

        INSERT INTO authors_product_categories (_parent_id, id, category, _order)
        SELECT v_old_author, gen_random_uuid()::text, cat_value,
               ROW_NUMBER() OVER (ORDER BY cat_value)
        FROM (
            SELECT DISTINCT c.value AS cat_value
            FROM products p
            JOIN categories c ON c.id = p.category_id
            WHERE p.author_id = v_old_author AND p.category_id IS NOT NULL
        ) AS unique_cats;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Триггеры
CREATE TRIGGER products_update_count
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_author_products_count();

CREATE TRIGGER products_update_categories
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_author_product_categories();

-- Перезаписать триггер:
-- psql -U art_user -d art_platform -f src/migrations/create_author_stats_triggers.sql
