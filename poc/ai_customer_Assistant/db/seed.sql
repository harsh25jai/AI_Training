TRUNCATE TABLE return_requests, shipments, orders, customers RESTART IDENTITY CASCADE;

INSERT INTO customers (id, external_customer_id, full_name, phone_number, email)
VALUES
('11111111-1111-1111-1111-111111111111', 'CUST-1001', 'Rahul Sharma', '9900000001', 'rahul@example.com'),
('22222222-2222-2222-2222-222222222222', 'CUST-1002', 'Anita Verma', '9900000002', 'anita@example.com'),
('33333333-3333-3333-3333-333333333333', 'CUST-1003', 'Amit Rao', '9900000003', 'amit@example.com'),
('44444444-4444-4444-4444-444444444444', 'CUST-1004', 'Sara Iyer', '9900000004', 'sara@example.com'),
('14141414-1414-1414-1414-141414141414', 'CUST-1005', 'Mahesh', '90008767899', 'mahesh@example.com'),
('15151515-1515-1515-1515-151515151515', 'CUST-1006', 'Suresh', '9087643521', 'suresh@example.com'),
('16161616-1616-1616-1616-161616161616', 'CUST-1007', 'Ramesh', '9000555555', 'ramesh@example.com');

INSERT INTO orders (id, order_id, customer_id, order_date, order_status, payment_status, total_amount, return_eligible, delivery_address_json, metadata)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1001', '11111111-1111-1111-1111-111111111111', '2026-03-20 10:00:00', 'shipped', 'paid', 2499.00, true,
 '{"city":"Bengaluru","state":"Karnataka","pincode":"560066"}',
 '{"brand":"Wrangler","channel":"web"}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1002', '22222222-2222-2222-2222-222222222222', '2026-03-18 15:30:00', 'delivered', 'paid', 1799.00, true,
 '{"city":"Mumbai","state":"Maharashtra","pincode":"400001"}',
 '{"brand":"Lee","channel":"web"}'),
('33333333-3333-3333-3333-333333333333', '1003', '11111111-1111-1111-1111-111111111111', '2026-03-19 10:00:00', 'shipped', 'paid', 1299.00, true,
 '{"city":"Bengaluru","state":"Karnataka","pincode":"560066"}',
 '{"brand":"Wrangler","channel":"web"}'),
('44444444-4444-4444-4444-444444444444', '1004', '22222222-2222-2222-2222-222222222222', '2026-03-17 12:00:00', 'invoiced', 'paid', 999.00, false,
 '{"city":"Mumbai","state":"Maharashtra","pincode":"400001"}',
 '{"brand":"Lee","channel":"web"}'),
('55555555-5555-5555-5555-555555555555', '1005', '33333333-3333-3333-3333-333333333333', '2026-03-16 09:15:00', 'ready_to_pickup', 'paid', 1599.00, true,
 '{"city":"Pune","state":"Maharashtra","pincode":"411001"}',
 '{"brand":"Lee","channel":"store"}'),
('66666666-6666-6666-6666-666666666666', '1006', '33333333-3333-3333-3333-333333333333', '2026-03-15 14:20:00', 'in_transit', 'paid', 1899.00, true,
 '{"city":"Hyderabad","state":"Telangana","pincode":"500001"}',
 '{"brand":"Wrangler","channel":"web"}'),
('77777777-7777-7777-7777-777777777777', '1007', '44444444-4444-4444-4444-444444444444', '2026-03-14 11:45:00', 'delivered', 'paid', 2199.00, true,
 '{"city":"Chennai","state":"Tamil Nadu","pincode":"600001"}',
 '{"brand":"Lee","channel":"web"}'),
('88888888-8888-8888-8888-888888888888', '1008', '44444444-4444-4444-4444-444444444444', '2026-03-13 16:10:00', 'cancelled', 'refunded', 799.00, false,
 '{"city":"Delhi","state":"Delhi","pincode":"110001"}',
 '{"brand":"Wrangler","channel":"web"}'),
('99999999-9999-9999-9999-999999999999', '1009', '11111111-1111-1111-1111-111111111111', '2026-03-12 10:05:00', 'delivered', 'paid', 1699.00, true,
 '{"city":"Jaipur","state":"Rajasthan","pincode":"302001"}',
 '{"brand":"Lee","channel":"web"}'),
('12121212-1212-1212-1212-121212121212', '1010', '22222222-2222-2222-2222-222222222222', '2026-03-11 13:35:00', 'delivered', 'paid', 1499.00, true,
 '{"city":"Kolkata","state":"West Bengal","pincode":"700001"}',
 '{"brand":"Wrangler","channel":"store"}'),
('13131313-1313-1313-1313-131313131313', '1011', '33333333-3333-3333-3333-333333333333', '2026-03-10 18:00:00', 'delivered', 'paid', 2099.00, true,
 '{"city":"Ahmedabad","state":"Gujarat","pincode":"380001"}',
 '{"brand":"Lee","channel":"web"}'),
('14141414-1414-1414-1414-141414141415', '1012', '14141414-1414-1414-1414-141414141414', '2026-03-21 10:30:00', 'in_transit', 'paid', 1899.00, true,
 '{"city":"Bengaluru","state":"Karnataka","pincode":"560001"}',
 '{"brand":"Wrangler","channel":"web"}'),
('15151515-1515-1515-1515-151515151516', '1013', '15151515-1515-1515-1515-151515151515', '2026-03-20 09:20:00', 'delivered', 'paid', 1299.00, true,
 '{"city":"Surat","state":"Gujarat","pincode":"395003"}',
 '{"brand":"Lee","channel":"store"}'),
('16161616-1616-1616-1616-161616161617', '1014', '16161616-1616-1616-1616-161616161616', '2026-03-19 15:10:00', 'cancelled', 'refunded', 999.00, false,
 '{"city":"Mysuru","state":"Karnataka","pincode":"570001"}',
 '{"brand":"Wrangler","channel":"web"}');

INSERT INTO shipments (id, order_id, shipment_status, courier_name, tracking_number, expected_delivery_date, shipped_at, last_tracking_update_at, tracking_payload)
VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'in_transit', 'BlueDart', 'TRK-1001', '2026-03-25', '2026-03-21 08:00:00', '2026-03-23 09:30:00',
 '{"latest_location":"Hosakote Hub","latest_event":"Reached sorting facility"}'),
('33333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'in_transit', 'BlueDart', 'TRK-1003', '2026-03-24', '2026-03-20 08:00:00', '2026-03-22 09:30:00',
 '{"latest_location":"Bengaluru Hub","latest_event":"Left origin facility"}'),
('55555555-5555-5555-5555-555555555556', '55555555-5555-5555-5555-555555555555', 'ready_to_pickup', 'StorePickup', 'TRK-1005', '2026-03-18', '2026-03-16 10:00:00', '2026-03-16 12:00:00',
 '{"latest_location":"Pune Store","latest_event":"Ready for pickup"}'),
('66666666-6666-6666-6666-666666666667', '66666666-6666-6666-6666-666666666666', 'in_transit', 'Delhivery', 'TRK-1006', '2026-03-20', '2026-03-16 09:00:00', '2026-03-18 10:00:00',
 '{"latest_location":"Hyderabad Hub","latest_event":"In transit"}'),
('77777777-7777-7777-7777-777777777778', '77777777-7777-7777-7777-777777777777', 'delivered', 'EcomExpress', 'TRK-1007', '2026-03-17', '2026-03-14 09:30:00', '2026-03-17 18:00:00',
 '{"latest_location":"Chennai","latest_event":"Delivered"}'),
('14141414-1414-1414-1414-141414141416', '14141414-1414-1414-1414-141414141415', 'in_transit', 'BlueDart', 'TRK-1012', '2026-03-26', '2026-03-22 08:00:00', '2026-03-24 10:00:00',
 '{"latest_location":"Bengaluru Hub","latest_event":"In transit"}'),
('15151515-1515-1515-1515-151515151517', '15151515-1515-1515-1515-151515151516', 'delivered', 'Delhivery', 'TRK-1013', '2026-03-23', '2026-03-21 09:00:00', '2026-03-23 18:00:00',
 '{"latest_location":"Surat","latest_event":"Delivered"}');

INSERT INTO return_requests (id, order_id, return_status, eligible, requested_at, approved_at, picked_up_at, refunded_at, refund_amount, reason, metadata)
VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pickup_scheduled', true, '2026-03-22 11:00:00', '2026-03-22 11:30:00', NULL, NULL, 1799.00, 'Size issue',
 '{"pickup_date":"2026-03-24","pickup_slot":"2pm-6pm"}'),
('99999999-9999-9999-9999-999999999990', '99999999-9999-9999-9999-999999999999', 'return_initiated', true, '2026-03-20 10:00:00', NULL, NULL, NULL, 1699.00, 'Defect',
 '{"note":"Awaiting approval"}'),
('12121212-1212-1212-1212-121212121213', '12121212-1212-1212-1212-121212121212', 'pickup_scheduled', true, '2026-03-21 11:00:00', '2026-03-21 12:00:00', NULL, NULL, 1499.00, 'Size issue',
 '{"pickup_date":"2026-03-23","pickup_slot":"10am-2pm"}'),
('13131313-1313-1313-1313-131313131314', '13131313-1313-1313-1313-131313131313', 'refund_completed', true, '2026-03-19 09:00:00', '2026-03-19 10:00:00', '2026-03-20 15:00:00', '2026-03-22 10:00:00', 2099.00, 'Late delivery',
 '{"refund_method":"original"}');
