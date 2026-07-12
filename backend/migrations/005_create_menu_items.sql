-- hotel.menu_items — admin-managed dining menu.
-- Mirrors the conventions of hotel.room_types (identity bigint, timestamptz, is_* flags).

CREATE TABLE IF NOT EXISTS hotel.menu_items (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         varchar(150)   NOT NULL,
    description  text           NOT NULL DEFAULT '',
    price        numeric(10, 2) NOT NULL CHECK (price >= 0),
    category     varchar(50)    NOT NULL,
    image_url    text           NOT NULL DEFAULT '',
    is_available boolean        NOT NULL DEFAULT true,
    is_featured  boolean        NOT NULL DEFAULT false,
    created_at   timestamptz    DEFAULT now(),
    updated_at   timestamptz    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON hotel.menu_items (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON hotel.menu_items (is_available);

-- Seed with the 16 placeholder items currently hardcoded in frontend/src/data/menu.ts,
-- so the live site keeps rendering the same menu the moment it switches to the DB.
INSERT INTO hotel.menu_items (name, description, price, category, image_url, is_featured)
VALUES
  ('Fluffy Buttermilk Pancakes', 'Stack of golden pancakes with maple syrup, fresh berries and a dust of icing sugar.', 220, 'Breakfast', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80', false),
  ('Eggs Benedict', 'Poached eggs on toasted English muffin, smoked ham and silky hollandaise.', 280, 'Breakfast', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80', true),
  ('Avocado Toast', 'Smashed avocado on sourdough with cherry tomatoes, chilli flakes and lime.', 240, 'Breakfast', 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80', false),
  ('Kanda Poha', 'Flattened rice tempered with onions, curry leaves, peanuts and a squeeze of lemon.', 150, 'Breakfast', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80', false),
  ('Butter Chicken', 'Tandoori chicken simmered in a rich tomato-butter gravy, finished with cream.', 420, 'Main Course', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80', true),
  ('Paneer Tikka Masala', 'Char-grilled cottage cheese in a spiced onion-tomato gravy with bell peppers.', 360, 'Main Course', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80', false),
  ('Hyderabadi Dum Biryani', 'Fragrant basmati layered with marinated meat, saffron and slow-cooked on dum.', 390, 'Main Course', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', false),
  ('Penne Arrabbiata', 'Penne tossed in a fiery tomato-garlic sauce with herbs and parmesan.', 320, 'Main Course', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80', false),
  ('Cold Brew Artisan Coffee', 'Slow steeped over 18 hours, served over ice for a smooth, bold finish.', 120, 'Drinks', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80', true),
  ('Vanilla Cappuccino', 'Espresso and steamed milk with a whisper of vanilla and velvety foam.', 140, 'Drinks', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80', true),
  ('Caffè Latte', 'Double-shot espresso layered with silky steamed milk and fine micro-foam.', 130, 'Drinks', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80', false),
  ('Classic Espresso', 'A concentrated shot of our signature house blend with a rich crema.', 90, 'Drinks', 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=600&q=80', false),
  ('Tiramisu', 'Espresso-soaked ladyfingers layered with mascarpone and cocoa.', 260, 'Desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', true),
  ('New York Cheesecake', 'Dense, creamy baked cheesecake on a buttery biscuit base with berry compote.', 240, 'Desserts', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80', false),
  ('Warm Chocolate Brownie', 'Fudgy dark-chocolate brownie served warm with vanilla ice cream.', 220, 'Desserts', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', false),
  ('Gulab Jamun', 'Golden milk dumplings soaked in cardamom-rose sugar syrup, served warm.', 160, 'Desserts', 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=600&q=80', false)
ON CONFLICT DO NOTHING;
