SELECT
    rt.name AS room_type,
    rt.base_price AS room_base_price,
    rt.tax_percent AS tax_percent,
    ROUND(rt.base_price + (rt.base_price * rt.tax_percent / 100.0), 2) AS room_final_price,
    rt.max_occupancy AS max_occupancy,
    COUNT(*) FILTER (WHERE r.status = 'available') AS available_rooms,
    rt.amenities AS amenities,
    rt.description AS description,
    rt.image_urls AS image_urls
FROM hotel.room_types AS rt
LEFT JOIN hotel.rooms AS r
    ON r.room_type_id = rt.id
WHERE rt.is_active = TRUE
GROUP BY rt.id, rt.name, rt.base_price, rt.tax_percent, rt.max_occupancy, rt.amenities, rt.description, rt.image_urls
ORDER BY rt.base_price ASC;
