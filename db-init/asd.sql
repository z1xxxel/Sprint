--
-- PostgreSQL database dump
--

\restrict JI0foHB66KhdsW7DdPHzs3ldAqKCWxLi4rdmZhKpXeksFSP3dgAjoA4F4ZccMhC

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-11-12 17:25:01

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5401 (class 0 OID 74500)
-- Dependencies: 236
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievements (id, code, description, icon_url, name, required_progress, reward_coins, type, group_code, level) FROM stdin;
1	EVENT_JOINER_5	Посетил 5 событий	medal1.png	Участник I	5	50.00	AUTOMATIC	EVENT_JOINER	1
2	EVENT_JOINER_10	Посетил 10 событий	medal2.png	Участник II	10	100.00	AUTOMATIC	EVENT_JOINER	2
3	EVENT_JOINER_20	Посетил 20 событий	medal3.png	Участник III	20	200.00	AUTOMATIC	EVENT_JOINER	3
4	SEASON_CHAMPION	1 место в общем рейтинге	gold.png	Чемпион сезона	0	0.00	AUTOMATIC	SEASON	1
5	SEASON_TOP_3	Топ-3 в общем рейтинге	silver.png	Лидер сезона	0	0.00	AUTOMATIC	SEASON	2
6	DEPT_TOP_1	1 место в своем подразделении	dept_gold.png	Гордость отдела I	0	0.00	AUTOMATIC	DEPT_TOP	1
7	BEST_EMPLOYEE	Особое достижение от руководства	star.png	Лучший сотрудник	0	500.00	MANUAL	BEST_EMPLOYEE	1
8	DEPT_TOP_2	Занял 2 место по рейтингу внутри отдела	\N	Лучший в отделе II	2	0.00	AUTOMATIC	DEPT_TOP	2
9	DEPT_TOP_3	Занял 3 место по рейтингу внутри отдела	\N	Лучший в отделе III	3	0.00	AUTOMATIC	DEPT_TOP	3
10	HELPER	Активно помогает коллегам	\N	Помощник	\N	300.00	MANUAL	HELPER	1
11	MENTOR	Обучает и поддерживает новых сотрудников	\N	Наставник	\N	500.00	MANUAL	MENTOR	1
12	INNOVATOR	Предложил и внедрил полезную идею	\N	Инноватор	\N	500.00	MANUAL	INNOVATOR	1
\.


--
-- TOC entry 5399 (class 0 OID 74389)
-- Dependencies: 234
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, description, image_url, name, sort_order) FROM stdin;
13	Одежда с корпоративной символикой.	/uploads/b039090b-3422-47ad-885f-3cc2d835512e.png	Текстиль	1
16		/uploads/683551b7-9979-4a8b-94a9-0eaf0619fa72.png	Кружки и термокружки	1
15		/uploads/aa75cd38-be6b-4eb6-8316-5465aa0e5b1e.jpg	Аксессуары	1
14	Брендированные гаджеты	/uploads/afc5dcbe-55f4-450b-ac63-1ce3cfbfe94a.webp	Гаджеты	1
17		/uploads/9e722cb4-f3ec-4fc6-838c-b47a8377f300.webp	Отдых	0
18	Тест	/uploads/1d32ede6-9f90-4192-bc07-f1c481fad521.png	Тест	5
19		/uploads/bb258781-27d5-402d-9261-1c8303b7829b.png	Категория	1
20	Тест	/uploads/80cc2d2e-5a8a-4f6c-816f-b685afa9b524.png	Тест1	1
\.


--
-- TOC entry 5429 (class 0 OID 74799)
-- Dependencies: 264
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, description, name) FROM stdin;
1	Серверная разработка	Backend Team
2	Клиентская разработка	Frontend Team
3	Тестирование и качество	QA Team
4	Техническая поддержка	Support Team
5	Отдел продаж	Sales Team
\.


--
-- TOC entry 5385 (class 0 OID 74162)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, balance, email, name, password, rating, role, department_id, is_blocked, lifetime_rating, monthly_earned_coins, last_monthly_reset, avatar_url, last_active_date, current_streak, longest_streak, last_streak_reward_at) FROM stdin;
8	1339.00	support@tms.local	Дмитрий Хелперов	qwerty	3	SUPPORT	4	f	50	100.00	2026-11-11 21:52:48.128401	\N	2026-11-11	1	2	0
1	48547.40	admin@tms.local	Сергей Админов	qwer	11	ADMIN	\N	f	1600	500.00	2026-11-06 19:32:10.711315	/uploads/6cea5f05-59ea-4eb6-b02f-bdb6bf983ee1.jpg	2026-11-11	1	13	13
9	3350.00	emp_sales@tms.local	Елена Продажникова	123	0	EMPLOYEE	5	f	8	2000.00	2026-10-29 21:38:50.187038	\N	\N	0	0	0
17	2400.00	test_emp_1793039916022_718@test.local	Test Employee	newPass2026!	0	EMPLOYEE	\N	t	0	2500.00	2026-10-26 21:38:36.565052	\N	\N	0	0	0
13	1150.00	admin_1793003360320_666@test.local	ADMIN 1793003360320_666	secret	0	ADMIN	\N	f	0	0.00	\N	\N	\N	0	0	0
15	0.00	test_emp_1793039848635_195@test.local	Test Employee	newPass2026!	0	EMPLOYEE	\N	t	0	0.00	\N	\N	\N	0	0	0
11	3000.00	support_1793003360320_666@test.local	SUPPORT 1793003360320_666	secret	0	SUPPORT	\N	f	0	2000.00	2026-10-29 21:39:39.883594	\N	\N	0	0	0
16	2000.00	test_mgr_1793039916022_718@test.local	Test Manager	secret	0	MANAGER	\N	f	0	2000.00	2026-10-29 21:39:50.455903	\N	\N	0	0	0
14	10500.00	test_mgr_1793039848635_195@test.local	Test Manager	secret	2	MANAGER	\N	f	105	500.00	2026-11-06 19:32:10.708314	\N	\N	0	0	0
18	0.00	test_mgr_1793040137732_595@test.local	Test Manager	secret	0	MANAGER	\N	f	0	0.00	\N	\N	\N	0	0	0
4	4200.00	mgr_front@tms.local	Анна Фронтендова	123	1	MANAGER	2	f	60	500.00	2026-10-30 08:39:19.95947	\N	2026-11-06	1	11	10
12	1567.00	employee_1793003360320_666@test.local	EMPLOYEE 1793003360320_666	qwert	8	EMPLOYEE	\N	f	55	1100.00	2026-11-06 19:32:10.729315	\N	2026-10-30	6	10	0
3	5600.00	mgr_back@tms.local	Иван Бэкендов	123	0	MANAGER	1	f	51	2000.00	2026-10-29 21:38:42.208697	\N	2026-10-28	9	9	0
19	400.00	test_emp_1793040137732_595@test.local	Test Employee	newPass2026!	0	EMPLOYEE	\N	t	0	500.00	2026-10-26 21:42:18.428283	\N	\N	0	0	0
23	0.00	hqqr@tms.local	Тест	ndKnmsew	0	EMPLOYEE	\N	f	0	0.00	\N	\N	\N	0	0	0
5	8600.00	emp_back@tms.local	Петр Кодеров	123	0	EMPLOYEE	3	f	1600	2000.00	2026-10-29 21:39:33.453373	\N	2026-10-28	9	9	0
24	0.00	hrqwee@tms.local	Тест	GvyT9472	0	SUPPORT	2	f	0	0.00	\N	\N	\N	0	0	0
2	18000.00	hr@tms.local	Ольга HR	123	2	HR	\N	f	150	0.00	\N	\N	2026-11-06	1	9	0
7	1950.00	emp_qa@tms.local	Алексей Тестировщиков	123	0	EMPLOYEE	3	f	20	100.00	2026-10-30 02:26:01.861696	\N	\N	0	0	0
6	3027.00	emp_front@tms.local	Мария Верстальщикова	123	0	EMPLOYEE	2	f	60	2000.00	2026-10-29 21:39:26.429453	\N	2026-10-28	9	9	0
20	6650.00	qweewq@tms.local	Обычный пользователь	qwer	6	EMPLOYEE	\N	f	27.5	3100.00	2026-11-06 19:32:10.674312	\N	2026-11-06	1	20	10
\.


--
-- TOC entry 5446 (class 0 OID 75689)
-- Dependencies: 281
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chats (id, created_at, last_message_at, participant1_id, participant2_id) FROM stdin;
1	2026-10-26 11:30:18.145093	2026-10-26 11:30:56.082284	5	6
3	2026-10-28 11:22:30.435589	2026-10-28 18:32:42.721259	1	2
2	2026-10-27 00:21:30.429935	2026-10-29 20:44:58.183704	1	12
4	2026-10-30 02:26:13.692509	2026-10-30 02:26:29.768801	1	7
5	2026-10-30 08:39:28.918886	2026-10-30 08:39:40.197864	1	4
6	2026-11-06 20:32:31.103608	2026-11-06 20:32:32.617761	3	20
7	2026-11-06 20:32:43.317359	2026-11-06 20:32:44.995716	13	20
\.


--
-- TOC entry 5444 (class 0 OID 75676)
-- Dependencies: 279
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, attachment_url, created_at, read_at, text, chat_id, sender_id, reply_to_id, edited_at) FROM stdin;
1	\N	2026-10-26 11:30:56.080209	\N	Привет! Как дела?	1	5	\N	\N
2	\N	2026-10-28 00:09:59.640789	2026-10-28 00:10:17.55402	йцу	2	1	\N	\N
3	\N	2026-10-28 00:10:03.029558	2026-10-28 00:10:17.55402	але	2	1	\N	\N
4	\N	2026-10-28 00:10:06.948507	2026-10-28 00:10:17.55402	дебил	2	1	\N	\N
9	\N	2026-10-28 11:54:59.221691	\N	але	3	1	\N	\N
10	http://localhost:8080/uploads/49a0befa-00ad-42f4-9b2d-9741eba4377e.png	2026-10-28 11:55:04.970303	\N		3	1	\N	\N
11	\N	2026-10-28 11:55:11.018252	\N	ага да	3	1	10	\N
5	\N	2026-10-28 11:22:36.136112	2026-10-28 19:52:22.619567	йцу	2	1	\N	\N
6	\N	2026-10-28 11:22:36.535804	2026-10-28 19:52:22.619567	уцй	2	1	\N	\N
7	http://localhost:8080/uploads/8e7f2109-990b-4bb5-b9ed-07fedbae8e53.png	2026-10-28 11:22:49.144335	2026-10-28 19:52:22.619567	qwe	2	1	\N	2026-10-28 11:42:42.401785
13	\N	2026-10-28 19:52:13.898845	2026-10-28 19:52:22.619567	йцу	2	1	\N	\N
14	\N	2026-10-28 19:52:14.944444	2026-10-28 19:52:22.619567	уцй	2	1	\N	\N
15	\N	2026-10-28 19:52:15.613958	2026-10-28 19:52:22.619567	йцу	2	1	\N	\N
16	\N	2026-10-28 19:52:33.637576	2026-10-28 19:59:59.531008	йцу	2	12	\N	\N
18	\N	2026-10-29 20:44:58.181696	2026-10-29 21:01:34.409707	сам	2	12	4	\N
20	/uploads/5944b177-4cd7-4444-95f3-28b080d9e4b4.png	2026-10-30 02:26:29.767802	\N	и отправить картинку	4	1	\N	\N
19	\N	2026-10-30 02:26:18.144653	\N	можем написатьйцу	4	1	\N	2026-10-30 02:26:33.897441
21	\N	2026-10-30 08:39:34.242992	2026-10-30 08:47:54.362029	Ты лучший сотрудник	5	1	\N	\N
22	\N	2026-10-30 08:39:36.146951	2026-10-30 08:47:54.362029	вот так вот	5	1	\N	\N
23	/uploads/72ce7400-9209-4260-95f3-86d9d4646fea.png	2026-10-30 08:39:40.196864	2026-10-30 08:47:54.362029		5	1	\N	\N
24	\N	2026-11-06 20:32:32.616754	\N	йцу\\ъ	6	20	\N	\N
25	\N	2026-11-06 20:32:44.995715	\N	йцу	7	20	\N	\N
\.


--
-- TOC entry 5393 (class 0 OID 74315)
-- Dependencies: 228
-- Data for Name: coin_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coin_transactions (id, from_user_id, to_user_id, amount, type, comment, created_at, tag, cancellation_reason, is_cancelled) FROM stdin;
1	\N	5	5000.00	SEASON_REWARD	Награда за 1 место в сезоне Q3	2026-09-26 10:29:10.770602	\N	\N	f
2	\N	5	50.00	QUEST_REWARD	Награда за квест: Помочь коллеге	2026-10-22 10:29:10.770602	\N	\N	f
3	\N	6	2500.00	SEASON_REWARD	Награда за 2 место в сезоне Q3	2026-09-26 10:29:10.770602	\N	\N	f
4	\N	6	100.00	EVENT_REWARD	Награда за событие: Забег	2026-10-22 10:29:10.770602	\N	\N	f
5	\N	8	500.00	ACHIEVEMENT	Награда за достижение: Лучший сотрудник	2026-10-24 10:29:10.770602	\N	\N	f
6	6	5	50.00	PEER_THANKS	Спасибо за помощь!	2026-10-25 10:29:10.770602	\N	\N	f
7	5	\N	150.00	PURCHASE	Покупка: Кружка	2026-10-25 10:29:10.770602	\N	\N	f
8	\N	9	1000.00	MANAGER_BONUS	Бонус за успешный релиз	2026-10-26 08:29:10.770602	\N	\N	f
9	\N	12	50.00	ACHIEVEMENT	Награда за достижение: Участник I	2026-10-26 11:29:20.84942	\N	\N	f
10	\N	17	500.00	MANAGER_BONUS	Bonus	2026-10-26 21:38:36.570735	\N	\N	f
11	17	\N	100.00	PENALTY	Штраф от Сергей Админов. Причина: Violation	2026-10-26 21:38:36.68388	\N	\N	f
12	\N	19	500.00	MANAGER_BONUS	Bonus	2026-10-26 21:42:18.437222	\N	\N	f
13	19	\N	100.00	PENALTY	Штраф от Сергей Админов. Причина: Violation	2026-10-26 21:42:18.549596	\N	\N	f
14	1	\N	880.00	PURCHASE	Покупка: Test Product 1793039848635_195 (x1)	2026-10-27 00:02:33.485095	\N	\N	f
15	\N	12	100.00	QUEST_REWARD	Награда за квест: Помочь коллеге	2026-10-27 10:37:47.211931	\N	\N	f
16	\N	12	200.00	QUEST_REWARD	Награда за квест: Прочитать книгу	2026-10-27 11:38:30.276298	\N	\N	f
17	5	\N	50.00	REFUND	Откат награды за событие #3: Забег. Причина: qwe	2026-10-27 11:47:52.496753	\N	\N	f
18	9	\N	50.00	REFUND	Откат награды за событие #3: Забег. Причина: qwe	2026-10-27 11:47:52.512776	\N	\N	f
19	\N	12	100.00	EVENT_REWARD	Награда за событие #6: Test 3	2026-10-27 11:50:13.779382	\N	\N	f
20	12	\N	100.00	REFUND	Откат награды за событие #6: Test 3. Причина: йцу	2026-10-27 11:50:55.986892	\N	\N	f
21	\N	12	300.00	QUEST_REWARD	Награда за квест: Пробежать 10 км	2026-10-28 11:17:50.866532	\N	\N	f
22	1	\N	1000.00	PURCHASE	Покупка: Худи (x1)	2026-10-28 19:01:26.255263	\N	\N	f
23	2	20	100.00	PEER_THANKS	Спасибо за помощь с релизом	2026-10-28 13:37:12.011699	\N	\N	f
24	14	12	50.00	PEER_THANKS	Отличная работа над проектом	2026-10-27 13:37:12.011699	\N	\N	f
25	20	12	20.00	PEER_THANKS	Выручил с задачей	2026-10-29 08:37:12.011699	\N	\N	f
26	12	20	30.00	PEER_THANKS	Спасибо за код-ревью	2026-10-26 13:37:12.011699	\N	\N	f
27	\N	20	200.00	EVENT_REWARD	Награда за событие: Забег на 5 км	2026-10-24 13:37:12.011699	\N	\N	f
28	\N	12	200.00	EVENT_REWARD	Награда за событие: Забег на 5 км	2026-10-24 13:37:12.011699	\N	\N	f
29	\N	20	1000.00	QUEST_REWARD	Награда за квест: Пройти курс по Java	2026-10-28 13:37:12.011699	\N	\N	f
30	\N	20	200.00	ACHIEVEMENT	Награда за достижение: Участник I	2026-10-27 13:37:12.011699	\N	\N	f
31	\N	12	500.00	MANAGER_BONUS	Бонус за отличную работу	2026-10-19 13:37:12.011699	\N	\N	f
32	20	\N	100.00	PENALTY	Штраф от Админ. Причина: опоздание	2026-10-25 13:37:12.011699	\N	\N	f
33	\N	1	7000.00	SEASON_REWARD	Награда за 1 место в сезоне Q1 2026	2026-10-29 13:38:23.197758	\N	\N	f
34	\N	5	4000.00	SEASON_REWARD	Награда за 2 место в сезоне Q1 2026	2026-10-29 13:38:23.208267	\N	\N	f
35	\N	2	3000.00	SEASON_REWARD	Награда за 3 место в сезоне Q1 2026	2026-10-29 13:38:23.212777	\N	\N	f
36	\N	5	100.00	SEASON_REWARD	Участие в сезоне Q1 2026 (отдел «Backend Team»)	2026-10-29 13:38:23.225846	\N	\N	f
37	\N	3	100.00	SEASON_REWARD	Участие в сезоне Q1 2026 (отдел «Backend Team»)	2026-10-29 13:38:23.226846	\N	\N	f
38	\N	4	100.00	SEASON_REWARD	Участие в сезоне Q1 2026 (отдел «Frontend Team»)	2026-10-29 13:38:23.227733	\N	\N	f
39	\N	6	100.00	SEASON_REWARD	Участие в сезоне Q1 2026 (отдел «Frontend Team»)	2026-10-29 13:38:23.228099	\N	\N	f
40	\N	8	100.00	SEASON_REWARD	Участие в сезоне Q1 2026 (отдел «Support Team»)	2026-10-29 13:38:23.229116	\N	\N	f
41	\N	7	100.00	SEASON_REWARD	Участие в сезоне Q1 2026 (отдел «QA Team»)	2026-10-29 13:38:23.229457	\N	\N	f
42	\N	9	100.00	SEASON_REWARD	Участие в сезоне Q1 2026 (отдел «Sales Team»)	2026-10-29 13:38:23.23053	\N	\N	f
43	\N	5	2500.00	SEASON_REWARD	1 место в подразделении «Backend Team» в сезоне Q1 2026	2026-10-29 13:38:23.299635	\N	\N	f
44	\N	3	1500.00	SEASON_REWARD	2 место в подразделении «Backend Team» в сезоне Q1 2026	2026-10-29 13:38:23.302823	\N	\N	f
45	\N	4	1250.00	SEASON_REWARD	1 место в подразделении «Frontend Team» в сезоне Q1 2026	2026-10-29 13:38:23.307117	\N	\N	f
46	\N	6	750.00	SEASON_REWARD	2 место в подразделении «Frontend Team» в сезоне Q1 2026	2026-10-29 13:38:23.313111	\N	\N	f
47	\N	8	1250.00	SEASON_REWARD	1 место в подразделении «Support Team» в сезоне Q1 2026	2026-10-29 13:38:23.318131	\N	\N	f
48	\N	7	1250.00	SEASON_REWARD	1 место в подразделении «QA Team» в сезоне Q1 2026	2026-10-29 13:38:23.32113	\N	\N	f
49	\N	9	1250.00	SEASON_REWARD	1 место в подразделении «Sales Team» в сезоне Q1 2026	2026-10-29 13:38:23.324131	\N	\N	f
50	12	\N	100.00	PENALTY	Штраф от Сергей Админов. Причина: йцу	2026-10-29 20:58:27.976275	\N	\N	f
52	\N	3	2000.00	ADMIN_ADJUSTMENT	йцу	2026-10-29 21:38:42.214213	\N	\N	f
53	\N	9	2000.00	ADMIN_ADJUSTMENT	Бонус от руководителя	2026-10-29 21:38:50.189037	\N	\N	f
54	\N	17	2000.00	ADMIN_ADJUSTMENT	Бонус от руководителя	2026-10-29 21:38:58.208096	\N	\N	f
55	\N	20	2000.00	ADMIN_ADJUSTMENT	Бонус от руководителя	2026-10-29 21:39:05.870605	\N	\N	f
56	\N	6	2000.00	MANAGER_BONUS	Бонус от руководителя	2026-10-29 21:39:26.431961	\N	\N	f
57	\N	5	2000.00	MANAGER_BONUS	Бонус от руководителя	2026-10-29 21:39:33.455877	\N	\N	f
58	\N	11	2000.00	MANAGER_BONUS	Бонус от руководителя	2026-10-29 21:39:39.884593	\N	\N	f
59	\N	16	2000.00	MANAGER_BONUS	Бонус от руководителя	2026-10-29 21:39:50.457902	\N	\N	f
60	8	\N	1111.00	PENALTY	Штраф от Сергей Админов. Причина: 123	2026-10-29 21:44:22.474019	\N	\N	f
61	1	\N	1400.00	PURCHASE	Покупка: Футболка (x1)	2026-10-29 23:21:54.456906	\N	\N	f
62	3	\N	500.00	REFUND	Отмена транзакции #51. Причина: йцу	2026-10-30 01:02:07.752698	\N	\N	f
51	\N	3	500.00	ACHIEVEMENT	Награда за достижение: Наставник	2026-10-29 21:38:08.679576	\N	йцу	t
63	1	7	50.00	PEER_THANKS	Наставил	2026-10-30 02:25:45.073592	MENTORING	\N	f
64	1	7	100.00	ADMIN_ADJUSTMENT	За помощь в оргинизации мероприятия	2026-10-30 02:26:01.869212	\N	\N	f
65	\N	7	300.00	ACHIEVEMENT	Награда за достижение: Помощник	2026-10-30 02:26:11.819165	\N	\N	f
66	\N	1	2000.00	QUEST_REWARD	Награда за квест: Организовать митап	2026-10-30 02:29:01.866607	\N	\N	f
67	1	\N	4000.00	PURCHASE	Покупка: Худи (x1)	2026-10-30 02:29:18.964437	\N	\N	f
68	1	\N	1800.00	PURCHASE	Покупка: USB-флешка (x2)	2026-10-30 02:29:18.972986	\N	\N	f
69	1	\N	441.60	PURCHASE	Покупка: Товар 1 (x1)	2026-10-30 02:29:18.978214	\N	\N	f
70	5	\N	500.00	PENALTY	Штраф от Сергей Админов. Причина: Нарушение	2026-10-30 02:30:10.73025	\N	\N	f
71	\N	1	50.00	ACHIEVEMENT	Награда за достижение: Участник I	2026-10-30 08:35:29.392394	\N	\N	f
72	1	5	50.00	PEER_THANKS	помог	2026-10-30 08:36:04.539394	FOR_HELP	\N	f
73	1	\N	3000.00	PURCHASE	Покупка: Сертификат на посещение катка (x2)	2026-10-30 08:39:05.777253	\N	\N	f
74	1	\N	1000.00	PURCHASE	Покупка: Название (x1)	2026-10-30 08:39:05.78775	\N	\N	f
75	1	4	500.00	ADMIN_ADJUSTMENT	йцу	2026-10-30 08:39:20.067311	\N	\N	f
76	\N	4	500.00	ACHIEVEMENT	Награда за достижение: Лучший сотрудник	2026-10-30 08:39:27.105262	\N	\N	f
77	20	\N	200.00	REFUND	Откат награды за событие #9: Забег на 5 км. Причина: дада	2026-10-30 08:41:14.435831	\N	\N	f
78	12	\N	200.00	REFUND	Откат награды за событие #9: Забег на 5 км. Причина: дада	2026-10-30 08:41:14.466888	\N	\N	f
79	12	\N	133.00	PENALTY	Штраф от Сергей Админов. Причина: почему бы и нет\n	2026-10-30 08:44:00.531929	\N	\N	f
81	1	\N	300.00	REFUND	Отмена транзакции #80. Причина: Случайно	2026-10-30 08:45:42.518554	\N	\N	f
80	\N	1	300.00	QUEST_REWARD	Награда за квест (одобрено админом): Пробежать 10 км	2026-10-30 08:44:11.748081	\N	Случайно	t
82	12	\N	2400.00	PURCHASE	Покупка: Термокружка (x2)	2026-10-30 08:49:08.158137	\N	\N	f
83	\N	12	100.00	QUEST_REWARD	Награда за квест (одобрено админом): Тест	2026-10-30 08:49:44.345449	\N	\N	f
84	\N	1	1000.00	QUEST_REWARD	Награда за квест: Пройти курс по Java	2026-10-30 08:50:24.308282	\N	\N	f
85	\N	20	500.00	EVENT_REWARD	Награда за событие #7: Воркшоп по архитектуре	2026-11-06 19:32:10.677312	\N	\N	f
86	\N	14	500.00	EVENT_REWARD	Награда за событие #7: Воркшоп по архитектуре	2026-11-06 19:32:10.710313	\N	\N	f
87	\N	1	500.00	EVENT_REWARD	Награда за событие #7: Воркшоп по архитектуре	2026-11-06 19:32:10.713315	\N	\N	f
88	\N	12	100.00	EVENT_REWARD	Награда за событие #11: Тест мероприятие 1	2026-11-06 19:32:10.730313	\N	\N	f
89	1	4	50.00	PEER_THANKS	Спасибо!	2026-11-06 20:19:09.170316	FOR_HELP	\N	f
90	1	20	100.00	PEER_THANKS	Спасибо!	2026-11-06 20:23:54.999601	FOR_HELP	\N	f
91	20	\N	200.00	PURCHASE	Покупка: Значок (x4)	2026-11-06 20:32:07.408352	\N	\N	f
92	20	\N	1500.00	PURCHASE	Покупка: Сертификат на посещение катка (x1)	2026-11-06 20:32:07.439536	\N	\N	f
93	20	\N	1500.00	PURCHASE	Покупка: Футболка (x1)	2026-11-06 20:32:07.44517	\N	\N	f
94	20	13	50.00	PEER_THANKS	Спасибо!	2026-11-06 20:32:53.040328	FOR_HELP	\N	f
95	20	13	100.00	PEER_THANKS	йцу	2026-11-06 20:33:02.722836	MENTORING	\N	f
96	\N	12	1000.00	QUEST_REWARD	Награда за квест: Пройти курс по Java	2026-11-06 20:37:03.459527	\N	\N	f
98	\N	20	500.00	QUEST_REWARD	Награда за квест: Пройди опрос	2026-11-06 20:47:18.112081	\N	\N	f
99	\N	20	2000.00	QUEST_REWARD	Награда за квест: Организовать митап	2026-11-06 20:47:18.924025	\N	\N	f
100	\N	1	111.00	REFUND	Отмена транзакции #97. Причина: йцу	2026-11-06 20:52:01.343178	\N	\N	f
97	1	\N	111.00	PENALTY	Штраф от Анна Фронтендова. Причина: йцу	2026-11-06 20:39:35.105366	\N	йцу	t
101	6	\N	123.00	PENALTY	Штраф от Сергей Админов. Причина: йцу	2026-11-06 20:52:51.550206	\N	\N	f
102	\N	20	100.00	EVENT_REWARD	Награда за событие #8: Пятничный покер	2026-11-11 21:52:48.046254	\N	\N	f
103	\N	8	100.00	EVENT_REWARD	Награда за событие #13: Тест 	2026-11-11 21:52:48.130399	\N	\N	f
\.


--
-- TOC entry 5421 (class 0 OID 74731)
-- Dependencies: 256
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seasons (id, closed_at, created_at, end_date, is_active, name, start_date) FROM stdin;
1	2026-09-26 10:29:10.770602	2026-07-26 10:29:10.770602	2026-09-26 10:29:10.770602	f	Q3 2026	2026-07-26 10:29:10.770602
2	\N	2026-09-26 10:29:10.770602	2026-12-26 10:29:10.770602	t	Q4 2026	2026-09-26 10:29:10.770602
4	2026-07-31 13:37:19.941227	2026-07-21 13:37:19.941227	2025-12-31 23:59:59	f	Q4 2025	2025-10-01 00:00:00
3	2026-10-29 13:38:23.337476	2026-10-29 13:37:19.941227	2026-03-31 23:59:59	f	Q1 2026	2026-01-01 00:00:00
5	2026-10-29 13:38:27.196535	2026-10-29 13:38:23.33848	2026-06-30 23:59:59	f	Q2 2026	2026-04-01 23:59:59
\.


--
-- TOC entry 5425 (class 0 OID 74772)
-- Dependencies: 260
-- Data for Name: department_member_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department_member_results (id, department_id, final_rating, place_in_department, reward_coins, user_id, user_name, season_id) FROM stdin;
1	1	150	1	\N	5	Петр Кодеров	1
2	1	100	2	\N	3	Иван Бэкендов	1
3	2	120	1	\N	6	Мария Верстальщикова	1
4	1	43	1	\N	5	Петр Кодеров	3
5	1	25.5	2	\N	3	Иван Бэкендов	3
6	2	30	1	\N	4	Анна Фронтендова	3
7	2	30	2	\N	6	Мария Верстальщикова	3
8	4	25	1	\N	8	Дмитрий Хелперов	3
9	3	10	1	\N	7	Алексей Тестировщиков	3
10	5	3	1	\N	9	Елена Продажникова	3
\.


--
-- TOC entry 5427 (class 0 OID 74785)
-- Dependencies: 262
-- Data for Name: department_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department_results (id, created_at, department_id, department_name, member_count, place, reward_coins_per_member, total_rating, season_id) FROM stdin;
1	2026-10-26 10:29:10.770602	1	Backend Team	2	1	50.00	250	1
2	2026-10-26 10:29:10.770602	2	Frontend Team	2	2	0.00	180	1
3	2026-10-29 13:38:23.23053	1	Backend Team	2	1	100.00	68.5	3
4	2026-10-29 13:38:23.306105	2	Frontend Team	2	2	100.00	60	3
5	2026-10-29 13:38:23.31662	4	Support Team	1	3	100.00	25	3
6	2026-10-29 13:38:23.320129	3	QA Team	1	4	100.00	10	3
7	2026-10-29 13:38:23.323131	5	Sales Team	1	5	100.00	3	3
\.


--
-- TOC entry 5395 (class 0 OID 74343)
-- Dependencies: 230
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, stock, image_url, type, category_id, is_active, has_variants) FROM stdin;
44	Значок	Значки случайные	50.00	85	/uploads/463b5b60-c623-4d45-9362-a5442d7df8f2.png	PHYSICAL	15	t	f
53	Термобутылка	Термобутылка брендированная	1000.00	18	/uploads/b9ec56f3-51c3-4c07-86f5-198d6b411f5d.png	PHYSICAL	16	t	f
31	Футболка	Футболка с логотипом компании	1400.00	67	/uploads/afcb7e7e-f555-4eab-bb28-7a6bb97cb56e.png	PHYSICAL	13	t	t
49	Сертификат на посещение катка	Сертификат на посещение катка	1500.00	120	/uploads/04deefc3-8adc-420d-a369-23a4125e2b9f.png	PHYSICAL	17	t	f
33	Худи	Худи с маленьким логотипом	3500.00	51	/uploads/0f088a22-fbc9-42c4-b639-f15e95cdbf8e.png	PHYSICAL	13	t	t
2	Худи	Удобное худи	1000.00	3	/uploads/aca45863-7e34-4ac1-9e4a-366f066b1a8f.png	PHYSICAL	\N	f	t
51	Бутылка спортивная	Спортивная бутылка брендированная	600.00	7	/uploads/62fde5b0-aee3-4c6b-95c6-ce977f443901.png	PHYSICAL	16	f	f
1	Кружка	Брендированная кружка	150.00	10	/uploads/3c5f0a17-0a79-4f87-9ebe-b7233ee2ac6f.png	PHYSICAL	\N	f	f
35	Свитшот	Свитшот с логотипом сервиса	2500.00	18	/uploads/d72883a9-3d59-4bd9-af4b-f3567cd0b6d3.png	PHYSICAL	13	t	t
3	Курс по Java	Видеокурс	5000.00	20	java.png	PERK	\N	f	f
13	Клавиатура	Механическая клавиатура	3000.00	10	\N	PHYSICAL	\N	f	f
4	Отгул на полдня	Уйти пораньше	800.00	50	\N	PERK	\N	f	f
22	Чашка	Керамическая чашка	350.00	100	\N	PHYSICAL	\N	f	f
30	Отгул	Дополнительный выходной день	5000.00	5	\N	PERK	\N	f	f
6	Test Product 1793039848635_195	\N	1000.00	18	\N	PHYSICAL	\N	f	f
7	Test Product 1793039916022_718		1000.00	9	http://localhost:8080/uploads/ff7f59c5-8ac2-477c-a68a-629c3949438e.png	PHYSICAL	\N	f	f
34	Худи	Худи с принтом на всю грудь	4000.00	47	/uploads/563cdfff-e949-49df-91fb-0c963891f234.png	PHYSICAL	13	t	t
36	Шопер	Шопер с логотипом сервиса	800.00	12	/uploads/b9e40d9f-8def-4d07-ade0-1ea3388d97c7.png	PHYSICAL	13	t	f
37	Бейсболка	Бейсболка с логотипом сервиса	600.00	15	/uploads/531b81e2-0b2b-4a15-9996-48e4fb5cd3da.png	PHYSICAL	13	t	f
38	Повербанк	Повербанк на 10000 мАч	3000.00	7	/uploads/1d0f3941-f853-422f-bef9-f0eca7371565.png	PHYSICAL	14	t	f
39	Беспроводная зарядка	Беспроводная зарядка	2500.00	5	/uploads/2a0b166d-3159-4234-8b24-23c520e62214.png	PHYSICAL	14	t	f
41	Мышка	Компьютерная мышь	1800.00	31	/uploads/6821ab30-fcea-469b-ac53-52fa746ad582.webp	PHYSICAL	14	t	f
42	Клавиатура	Брендированная клавиатура	2500.00	4	/uploads/53f87134-4371-481c-bf97-1ff66683064b.png	PHYSICAL	14	t	f
43	Наушники	Наушники брендированные	3000.00	4	/uploads/ac088799-af43-4cd5-8622-b20155fcd104.png	PHYSICAL	14	t	f
45	Ручка	Ручка брендированная	100.00	56	/uploads/0aa647be-a0a4-4c97-9977-f64e62f63826.png	PHYSICAL	15	t	f
46	Блокнот	Блокнот	250.00	33	/uploads/a3cc449f-aa94-4b43-aa06-cbfcf2447e46.png	PHYSICAL	15	t	f
47	Отгул	Отгул на 1 день	6000.00	999	/uploads/d8669752-8259-4a03-9a17-fb501c87f2fb.webp	PHYSICAL	17	t	f
48	Сертификат в аквапарк	Сертификат на поход в аквапарк	4000.00	999	/uploads/61fe1e64-a689-40ac-af2e-37d2e804ad30.png	PHYSICAL	17	t	f
40	USB-флешка	брендированная флешка на 128гб	900.00	20	/uploads/ee448ce2-95b0-4fc1-abfe-efdc4bde7717.png	PHYSICAL	14	t	f
54	Товар 1	Описание	552.00	20	/uploads/32dad408-d85f-4264-ab76-1bff86416f65.png	PHYSICAL	18	t	t
32	Футболка	Футболка с логотипом сервиса	1500.00	41	/uploads/de2e3d1c-4cfa-4ae5-a757-58119fa8c7f9.webp	PHYSICAL	13	t	t
55	Название	123	1000.00	27	/uploads/c39d3873-406a-471b-b620-e8ccd75e1324.png	PHYSICAL	13	t	t
50	Кружка	Брендированная кружка	900.00	1	/uploads/dd8bf683-ebf0-49e3-abed-150593d2ae9a.png	PHYSICAL	16	t	f
52	Термокружка	Термокружка брендированная	1200.00	13	/uploads/7ce3ab4c-5568-4fe4-b072-6ce35ec84169.png	PHYSICAL	16	t	f
56	ТЕст	Тест	1000.00	20	/uploads/412bea7a-0a33-4b21-9248-8b9e7bf48f4d.png	PHYSICAL	20	t	t
\.


--
-- TOC entry 5449 (class 0 OID 75736)
-- Dependencies: 284
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discounts (id, product_id, percent, valid_from, valid_to, is_active, created_at) FROM stdin;
1	6	20	2026-10-26 18:37:29.693	2026-10-27 18:37:29.693	t	2026-10-26 21:37:29.717458
2	7	20	2026-10-26 18:38:36.801	2026-10-27 18:38:36.801	f	2026-10-26 21:38:36.814202
4	54	20	2026-10-29 23:25:16	2026-11-05 23:25:17	t	2026-10-30 02:25:17.544908
5	32	20	2026-10-30 05:27:41	2026-11-06 05:27:42	f	2026-10-30 08:27:42.10693
6	32	32	2026-10-30 05:28:00	2026-11-06 05:28:01	f	2026-10-30 08:28:01.324641
7	32	32	2026-10-30 05:28:03	2026-11-06 05:28:04	t	2026-10-30 08:28:04.03008
8	31	20	2026-10-30 05:38:05	2026-11-06 05:38:06	t	2026-10-30 08:38:06.487611
\.


--
-- TOC entry 5389 (class 0 OID 74240)
-- Dependencies: 224
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, category, comment_to_admin, description, event_place, event_status, from_time, name_event, to_time, organizer_id, reward_coins, reward_rating, paid_in_coins, rewards_granted) FROM stdin;
4	IT	йцууууу	йцууцй	Тест место	COMPLETED	2026-10-27 10:17:00	Тест	2026-10-27 10:20:00	12	\N	\N	f	t
1	IT	\N	Обсуждаем архитектуру	Москва	CANCELLED	2026-10-27 10:29:10.770602	IT Meetup	2026-10-28 10:29:10.770602	3	100.00	5	t	f
5	ТЕст	ПРиветик	Тест	Место тест	COMPLETED	2026-10-27 11:38:00	Событие тест 2	2026-10-27 11:39:00	12	\N	\N	f	t
3	Sport	[ОТКАТ НАГРАД] qwe	Бежим 5 км	Парк	CANCELLED	2026-10-21 10:29:10.770602	Забег	2026-10-22 10:29:10.770602	3	50.00	2	t	f
6	IT	Тест\n[ОТКАТ НАГРАД] йцу	Тест 3	Тест 3	CANCELLED	2026-10-27 11:49:00	Test 3	2026-10-27 11:50:00	1	100.00	1	t	f
10	Развлечения	\N	Смотрим фильм вместе	Переговорка А	CANCELLED	2026-10-30 13:35:56.856903	Киновечер	2026-10-30 14:35:56.856903	11	\N	\N	f	f
9	Спорт	[ОТКАТ НАГРАД] дада	Спортивное мероприятие	Парк	CANCELLED	2026-10-24 13:35:56.856903	Забег на 5 км	2026-10-24 11:35:56.856903	2	200.00	1	t	f
2	Soft Skills	\N	Как общаться	Онлайн	COMPLETED	2026-10-29 10:29:10.770602	Коммуникация	2026-10-30 10:29:10.770602	4	\N	\N	f	t
7	Обучение	\N	Разбираем микросервисы	Онлайн	COMPLETED	2026-11-03 13:35:56.856903	Воркшоп по архитектуре	2026-11-03 15:35:56.856903	2	500.00	2	t	t
11	Тест категория 1	йцу	Описание	Тест место 1	COMPLETED	2026-10-31 08:22:00	Тест мероприятие 1	2026-10-31 09:22:00	1	100.00	1	t	t
12	Категория	пж организуйте\n[ОТКАТ НАГРАД] qwe	Описание	Место	CANCELLED	2026-10-31 08:36:00	Тест 1	2026-10-31 09:37:00	1	100.00	1	t	f
8	Тимбилдинг	\N	Играем в покер в офисе	Офис, 4 этаж	COMPLETED	2026-11-08 13:35:56.856903	Пятничный покер	2026-11-08 16:35:56.856903	14	100.00	1	t	t
13	IT	Монеты	Тест	Тест	COMPLETED	2026-11-07 20:29:00	Тест 	2026-11-07 21:29:00	20	100.00	1	t	t
\.


--
-- TOC entry 5391 (class 0 OID 74275)
-- Dependencies: 226
-- Data for Name: event_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_participants (id, event_id, user_id) FROM stdin;
1	1	5
2	1	6
3	1	7
4	3	5
5	3	9
6	4	1
7	1	12
8	5	1
9	1	1
11	6	12
12	7	20
14	7	14
15	9	20
16	9	12
17	10	1
18	2	1
19	7	1
20	11	12
21	2	12
22	8	20
23	13	8
\.


--
-- TOC entry 5439 (class 0 OID 75471)
-- Dependencies: 274
-- Data for Name: favorite_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorite_products (id, added_at, product_id, user_id) FROM stdin;
4	2026-10-30 00:20:41.213626	40	1
6	2026-10-30 08:49:18.264778	53	12
7	2026-11-06 20:31:48.652452	32	20
\.


--
-- TOC entry 5459 (class 0 OID 75878)
-- Dependencies: 294
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.news (id, content, cover_url, created_at, is_pinned, title, updated_at, author_id, views, expires_at, is_archived, archived_at) FROM stdin;
4	Мы отлично поработали в этом квартале!	\N	2026-10-28 13:37:30.929819	f	Итоги квартала	2026-10-28 13:37:30.929819	1	42	2026-11-03 13:37:30.929819	f	\N
5	Встречаемся 25 декабря в 18:00 в ресторане "Прага". Будет весело!	https://example.com/cover3.jpg	2026-10-29 01:37:30.929819	f	Новогодний корпоратив	2026-10-29 01:37:30.929819	2	88	2026-12-28 13:37:30.929819	f	\N
6	Эта новость уже неактуальна	\N	2026-10-19 13:37:30.929819	f	Старая новость	2026-10-30 02:20:29.203831	1	12	2026-10-28 13:37:30.929819	t	\N
9	Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, \n![изображение](/uploads/f8ab3beb-8490-40be-8bd0-b75c76ef3652.png)\nТест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, \n![изображение](/uploads/133fbf5c-da9b-4efc-b9aa-44ecd22c5994.jpg)\nТест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, Тест новость описание, \n![изображение](/uploads/c14db77a-7571-4028-8842-59e84c70fca3.webp)	/uploads/93085851-f66e-4aef-a3b8-30c8c61844ac.jpg	2026-10-30 02:21:32.400927	f	Тест новость	2026-11-06 20:27:37.272433	1	2	2026-11-06 02:21:00	t	2026-10-30 08:35:05.866172
7	Завтра офис закрыт на санитарную обработку	/uploads/a657c59f-5857-4f60-ab05-f200783a9f43.jpg	2026-10-29 12:37:30.929819	f	Важное объявление	2026-10-30 02:20:43.851284	2	7	2026-10-31 13:37:00	t	2026-10-30 02:20:43.84978
3	Ура! Мы запустили нашу платформу вовлеченности ПУЛЬС. Теперь вы можете получать монеты за активность и тратить их в магазине.	/uploads/72d0bc5d-673a-4d09-b6ef-6493c9b73777.jpg	2026-10-27 13:37:30.929819	t	Запуск платформы ПУЛЬС!	2026-10-30 08:36:34.312739	2	153	2026-11-28 13:37:00	f	\N
8	Тест описание, Тест описание, Тест описание, Тест описание, Тест описание,  \n![Рис. 1. Клавиатура](/uploads/bc8b5f65-ed0c-41a0-aa74-625177a6f142.png)\nТест описание, Тест описание, Тест описание, Тест описание, Тест описание,\n\n![изображение](/uploads/92524352-9ec9-46d4-a9a1-a72206891b74.png)\nТест описание, Тест описание, Тест описание, Тест описание, Тест описание,	/uploads/b4f1fafe-dbbd-4154-bda2-e57618c23b1e.jpg	2026-10-29 20:31:21.246711	t	Тест 1	2026-11-06 20:26:12.485323	1	4	2026-11-29 08:34:00	f	\N
10	Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, \n![изображение](/uploads/db412cb9-048f-4cd8-ab48-16579d8543cd.png)\nТест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость, Тест новость,	/uploads/fdad82e1-2a83-4318-81c3-be2001348695.jpg	2026-11-06 20:49:23.792077	t	Тест	2026-11-06 20:49:41.608603	1	1	2026-11-07 20:49:00	t	2026-11-06 20:49:41.606597
\.


--
-- TOC entry 5461 (class 0 OID 75901)
-- Dependencies: 296
-- Data for Name: news_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.news_ratings (id, created_at, news_id, user_id, value) FROM stdin;
1	2026-10-29 13:37:30.929819	3	20	5
2	2026-10-29 13:37:30.929819	3	12	4
3	2026-10-29 13:37:30.929819	3	14	5
4	2026-10-29 13:37:30.929819	4	11	4
6	2026-10-30 02:21:39.387279	9	1	5
7	2026-10-30 02:32:30.375922	8	12	5
5	2026-10-29 20:31:27.551344	8	1	3
8	2026-10-30 08:36:36.020579	3	1	5
9	2026-10-30 08:47:42.465364	3	4	5
10	2026-10-30 08:47:46.257081	8	4	5
11	2026-11-06 20:26:19.190926	8	20	5
12	2026-11-06 20:49:32.292776	10	1	5
\.


--
-- TOC entry 5455 (class 0 OID 75815)
-- Dependencies: 290
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, product_id, size, color, stock) FROM stdin;
77	32	XXS	Черный	4
79	32	S	Черный	4
4	2	M	Синий	15
5	2	L	Синий	15
80	32	M	Черный	5
81	32	L	Черный	5
82	32	XL	Черный	5
83	32	XXL	Черный	7
84	32	XXXL	Черный	6
93	33	XXS	Черный	10
94	33	XS	Черный	12
95	33	S	Черный	6
96	33	M	Черный	7
97	33	L	Черный	7
98	33	XL	Черный	3
99	33	XXL	Черный	0
100	33	XXXL	Черный	6
101	34	XXS	Черный	0
103	34	S	Черный	5
104	34	M	Черный	5
105	34	L	Черный	3
106	34	XL	Черный	6
107	34	XXL	Черный	5
108	34	XXXL	Черный	1
109	34	XXS	Белый	1
110	34	XS	Белый	3
111	34	S	Белый	2
112	34	M	Белый	3
113	34	L	Белый	4
114	34	XL	Белый	2
115	34	XXL	Белый	2
116	34	XXXL	Белый	2
117	35	XXS	Черный	0
118	35	XS	Черный	0
119	35	S	Черный	4
120	35	M	Черный	4
121	35	L	Черный	3
122	35	XL	Черный	3
123	35	XXL	Черный	1
124	35	XXXL	Черный	3
125	54	XXS	Черный	4
126	54	XS	Черный	3
128	54	M	Черный	3
129	54	L	Черный	3
130	54	XL	Черный	3
131	54	XXL	Черный	0
132	54	XXXL	Черный	0
133	54	XXS	Белый	0
134	54	XS	Белый	0
135	54	S	Белый	0
136	54	M	Белый	0
137	54	L	Белый	0
138	54	XL	Белый	0
139	54	XXL	Белый	0
140	54	XXXL	Белый	0
102	34	XS	Черный	3
127	54	S	Черный	4
141	31	XXS	Черный	5
142	31	XS	Черный	7
143	31	S	Черный	2
144	31	M	Черный	4
145	31	L	Черный	7
146	31	XL	Черный	1
147	31	XXL	Черный	4
148	31	XXXL	Черный	2
149	31	XXS	Белый	6
150	31	XS	Белый	2
151	31	S	Белый	5
152	31	M	Белый	4
153	31	L	Белый	3
154	31	XL	Белый	4
155	31	XXL	Белый	4
156	31	XXXL	Белый	7
157	55	XXS	Черный	4
158	55	XS	Черный	7
159	55	S	Черный	6
160	55	M	Черный	4
161	55	L	Черный	5
163	55	XXL	Черный	0
164	55	XXXL	Черный	0
165	55	XXS	Белый	0
166	55	XS	Белый	0
167	55	S	Белый	0
168	55	M	Белый	0
169	55	L	Белый	0
170	55	XL	Белый	0
171	55	XXL	Белый	0
172	55	XXXL	Белый	0
162	55	XL	Черный	1
78	32	XS	Черный	5
173	56	XXS	Черный	4
174	56	XS	Черный	5
175	56	S	Черный	0
176	56	M	Черный	0
177	56	L	Черный	0
178	56	XL	Черный	0
179	56	XXL	Черный	0
180	56	XXXL	Черный	0
181	56	XXS	Белый	0
182	56	XS	Белый	0
183	56	S	Белый	0
184	56	M	Белый	0
185	56	L	Белый	6
186	56	XL	Белый	5
187	56	XXL	Белый	0
188	56	XXXL	Белый	0
\.


--
-- TOC entry 5397 (class 0 OID 74356)
-- Dependencies: 232
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, product_id, quantity, total_price, created_at, status, admin_comment, variant_id, user_comment) FROM stdin;
3	7	2	1	800.00	2026-10-23 10:29:10.770602	REJECTED	Нет в наличии	\N	\N
4	9	3	1	5000.00	2026-10-16 10:29:10.770602	COMPLETED	\N	\N	\N
2	6	4	1	800.00	2026-10-24 10:29:10.770602	COMPLETED	Отдыхай!	\N	\N
1	5	1	1	150.00	2026-10-25 10:29:10.770602	COMPLETED	\N	\N	\N
6	1	2	1	1000.00	2026-10-28 19:01:26.258773	COMPLETED	\N	\N	\N
5	1	6	1	880.00	2026-10-27 00:02:33.50011	COMPLETED	\N	\N	\N
7	20	2	1	1500.00	2026-10-24 13:37:16.098328	COMPLETED	Выдано на ресепшене	\N	\N
10	20	13	1	3000.00	2026-10-19 13:37:16.098328	REJECTED	Нет в наличии	\N	\N
9	12	30	1	5000.00	2026-10-27 13:37:16.098328	COMPLETED	\N	\N	\N
8	12	22	2	700.00	2026-10-28 13:37:16.098328	COMPLETED	\N	\N	\N
11	1	31	1	1400.00	2026-10-29 23:21:54.45891	COMPLETED	\N	\N	\N
14	1	54	1	441.60	2026-10-30 02:29:18.979213	COMPLETED	\N	127	
13	1	40	2	1800.00	2026-10-30 02:29:18.973691	COMPLETED	\N	\N	
12	1	34	1	4000.00	2026-10-30 02:29:18.965968	COMPLETED	\N	102	
15	1	49	2	3000.00	2026-10-30 08:39:05.781292	COMPLETED	\N	\N	йцу
16	1	55	1	1000.00	2026-10-30 08:39:05.789755	COMPLETED	\N	162	йцу
20	20	32	1	1500.00	2026-11-06 20:32:07.44517	COMPLETED	\N	78	
19	20	49	1	1500.00	2026-11-06 20:32:07.441719	COMPLETED	\N	\N	
18	20	44	4	200.00	2026-11-06 20:32:07.411783	COMPLETED	\N	\N	
17	12	52	2	2400.00	2026-10-30 08:49:08.159807	COMPLETED	\N	\N	
\.


--
-- TOC entry 5462 (class 0 OID 75923)
-- Dependencies: 297
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (product_id, image_url) FROM stdin;
34	/uploads/dfca3e03-a796-4d5f-9352-4f6a6b879fc7.png
41	/uploads/a7cb9ef4-3677-4df1-9d34-efbd91c45d03.webp
50	/uploads/56da81c3-5379-4e09-a915-015a8db8e424.png
31	/uploads/b4d2e778-8329-44e2-9820-07a0775d5b3e.png
56	/uploads/1697df16-40e1-444d-943b-71ddcf2b12e0.png
\.


--
-- TOC entry 5441 (class 0 OID 75481)
-- Dependencies: 276
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_reviews (id, comment, created_at, rating, product_id, user_id) FROM stdin;
\.


--
-- TOC entry 5435 (class 0 OID 74879)
-- Dependencies: 270
-- Data for Name: quests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quests (id, created_at, description, is_active, reward_coins, title, creator_id, audience_description, deadline, penalty_coins, penalty_rating, is_mandatory, is_public, reward_rating, cooldown_hours, is_repeatable) FROM stdin;
1	2026-10-26 10:29:10.770602	Прочитать книгу по программированию	t	200.00	Прочитать книгу	3	\N	\N	\N	\N	f	t	\N	\N	f
2	2026-10-26 10:29:10.770602	Спортивный челлендж	t	300.00	Пробежать 10 км	4	\N	\N	\N	\N	f	t	\N	\N	f
3	2026-10-26 10:29:10.770602	Помочь с задачами другому отделу	t	100.00	Помочь коллеге	2	\N	\N	\N	\N	f	t	\N	\N	f
4	2026-10-29 13:35:35.67781	Просмотреть 10 лекций и сдать тест	t	1000.00	Пройти курс по Java	2	Все сотрудники	2026-11-08 13:35:35.67781	0.00	0	f	t	2	\N	f
5	2026-10-29 13:35:35.67781	Провести внутренний митап по обмену опытом	t	2000.00	Организовать митап	2	Все сотрудники	2026-11-18 13:35:35.67781	0.00	0	f	t	5	\N	f
6	2026-10-29 13:35:35.67781	Статья на 3000+ символов	t	800.00	Написать статью в блог	2	Все сотрудники	2026-11-03 13:35:35.67781	0.00	0	f	t	1	\N	f
7	2026-10-29 13:35:35.67781	Обязательный опрос по вовлеченности	t	500.00	Пройди опрос	2	Все сотрудники	2026-11-01 13:35:35.67781	100.00	1	t	f	0	\N	f
8	2026-10-29 13:35:35.67781	5 дней подряд делать зарядку	t	300.00	Утренняя зарядка	2	Все сотрудники	2026-11-05 13:35:35.67781	0.00	0	f	t	1.5	\N	f
9	2026-10-29 13:35:35.67781	Онбординг нового сотрудника	t	1500.00	Помощь новичку	2	Все сотрудники	\N	0.00	0	f	t	3	\N	f
10	2026-10-30 08:46:44.066596	Описание	t	100.00	Тест	1	Сотрудники: 1 чел.	\N	412.00	2	t	f	0	\N	f
11	2026-11-06 20:36:54.239666	Тест	t	100.00	Тест	4	Отделы: Frontend Team, Backend Team, QA Team · Сотрудники: 1 чел.	2026-11-13 20:35:00	55.00	5	t	f	1	\N	f
\.


--
-- TOC entry 5423 (class 0 OID 74753)
-- Dependencies: 258
-- Data for Name: rating_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rating_transactions (id, user_id, amount, reason, created_at) FROM stdin;
1	5	150	Награда за событие: Забег	2026-10-22 10:29:10.770602
2	5	5	Прохождение опроса: Опрос Q4	2026-10-26 10:29:10.770602
3	6	120	Награда за событие: IT Meetup	2026-10-24 10:29:10.770602
4	6	10	Отличный отзыв за тикет #3	2026-10-22 10:29:10.770602
5	8	2	Отличный отзыв за тикет #3	2026-10-22 10:29:10.770602
6	8	5	Бонус за победу подразделения «Support Team»	2026-09-26 10:29:10.770602
7	9	5	Бонус за победу подразделения «Sales Team»	2026-10-26 05:29:10.770602
8	17	-2	Штраф от Сергей Админов. Причина: Violation	2026-10-26 21:38:36.685887
9	19	-2	Штраф от Сергей Админов. Причина: Violation	2026-10-26 21:42:18.551578
10	5	-2	Откат рейтинга за событие #3: Забег. Причина: qwe	2026-10-27 11:47:52.507265
11	9	-2	Откат рейтинга за событие #3: Забег. Причина: qwe	2026-10-27 11:47:52.513775
12	12	1	Награда за событие #6: Test 3	2026-10-27 11:50:13.778382
13	12	-1	Откат рейтинга за событие #6: Test 3. Причина: йцу	2026-10-27 11:50:55.988892
14	12	2	Прохождение опроса: Опрос Q4	2026-10-28 00:05:29.848406
15	1	2	Прохождение опроса: Опрос Q4	2026-10-28 00:08:36.029572
16	1	2	Прохождение опроса: Тест1	2026-10-28 00:13:46.484071
17	1	2	Прохождение опроса: QWE	2026-10-28 21:22:13.333672
18	20	2	Награда за событие: Забег на 5 км	2026-10-24 13:37:12.011699
19	12	2	Награда за событие: Забег на 5 км	2026-10-24 13:37:12.011699
20	20	2	Награда за квест: Пройти курс по Java	2026-10-28 13:37:12.011699
21	12	5	Награда за квест: Организовать митап	2026-10-22 13:37:12.011699
22	20	-1	Штраф за невыполнение квеста: Утренняя зарядка	2026-10-28 13:37:12.011699
23	14	1	Streak 10 дней: +1 за 10 дней;	2026-10-27 13:37:12.011699
24	3	-25.5	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.331142
25	5	-43	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.332143
26	6	-30	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.333141
27	4	-30	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.33347
28	7	-10	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.334473
29	8	-25	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.334473
30	9	-3	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.335472
31	2	-30	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.335472
32	1	-50	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.335472
33	14	-25	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.33647
34	12	-10	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.33647
35	20	-12.5	Сброс рейтинга после сезона Q1 2026	2026-10-29 13:38:23.336973
36	12	-20	Штраф от Сергей Админов. Причина: йцу	2026-10-29 20:58:27.978275
37	4	1	Streak 10 дней: +1 за 10 дней;	2026-10-29 21:31:49.373336
38	4	1	Streak 10 дней: +1 за 10 дней;	2026-10-29 21:31:49.413096
39	1	1	Streak 13 дней: +1 за 10 дней;	2026-10-30 00:29:49.873464
40	1	1	Прохождение опроса: Опрос удовлетворенности	2026-10-30 02:23:30.818432
41	1	2	Отличный отзыв за тикет #11	2026-10-30 02:28:45.953007
42	1	5	Награда за квест: Организовать митап	2026-10-30 02:29:01.864092
43	12	2	Прохождение опроса: Тест1	2026-10-30 02:32:44.799872
44	20	-1	Откат рейтинга за событие #9: Забег на 5 км. Причина: дада	2026-10-30 08:41:14.438342
45	12	-1	Откат рейтинга за событие #9: Забег на 5 км. Причина: дада	2026-10-30 08:41:14.466888
46	12	-4	Штраф от Сергей Админов. Причина: почему бы и нет\n	2026-10-30 08:44:00.5323
47	12	2	Прохождение опроса: QWE	2026-10-30 08:48:48.263685
48	12	1	Прохождение опроса: Опрос удовлетворенности	2026-10-30 08:48:50.655473
49	12	2	Прохождение опроса: Опрос 1	2026-10-30 08:48:55.031924
50	1	2	Награда за квест: Пройти курс по Java	2026-10-30 08:50:24.307583
51	8	2	Отличный отзыв за тикет #12	2026-10-30 08:51:04.751471
52	20	2	Награда за событие #7: Воркшоп по архитектуре	2026-11-06 19:32:10.675312
53	14	2	Награда за событие #7: Воркшоп по архитектуре	2026-11-06 19:32:10.709314
54	1	2	Награда за событие #7: Воркшоп по архитектуре	2026-11-06 19:32:10.712314
55	12	1	Награда за событие #11: Тест мероприятие 1	2026-11-06 19:32:10.729315
56	6	-1	Штраф за непрохождение опроса: Опрос Q4	2026-11-06 19:32:10.808314
57	7	-1	Штраф за непрохождение опроса: Опрос Q4	2026-11-06 19:32:10.810313
58	9	-1	Штраф за непрохождение опроса: Опрос Q4	2026-11-06 19:32:10.812315
59	19	-1	Штраф за непрохождение опроса: Опрос Q4	2026-11-06 19:32:10.813315
60	20	-1	Штраф за непрохождение опроса: Опрос Q4	2026-11-06 19:32:10.814314
61	15	-1	Штраф за непрохождение опроса: Опрос Q4	2026-11-06 19:32:10.815314
62	17	-1	Штраф за непрохождение опроса: Опрос Q4	2026-11-06 19:32:10.816312
63	5	-1	Штраф за непрохождение опроса: Тест1	2026-11-06 19:32:10.826314
64	6	-1	Штраф за непрохождение опроса: Тест1	2026-11-06 19:32:10.827313
65	7	-1	Штраф за непрохождение опроса: Тест1	2026-11-06 19:32:10.828314
66	9	-1	Штраф за непрохождение опроса: Тест1	2026-11-06 19:32:10.844313
67	20	-1	Штраф за непрохождение опроса: Тест1	2026-11-06 19:32:10.845314
68	19	-1	Штраф за непрохождение опроса: Тест1	2026-11-06 19:32:10.846314
69	15	-1	Штраф за непрохождение опроса: Тест1	2026-11-06 19:32:10.846314
70	17	-1	Штраф за непрохождение опроса: Тест1	2026-11-06 19:32:10.847313
71	5	-1	Штраф за непрохождение опроса: QWE	2026-11-06 19:32:10.855313
72	6	-1	Штраф за непрохождение опроса: QWE	2026-11-06 19:32:10.856312
73	7	-1	Штраф за непрохождение опроса: QWE	2026-11-06 19:32:10.857314
74	9	-1	Штраф за непрохождение опроса: QWE	2026-11-06 19:32:10.858314
75	20	-1	Штраф за непрохождение опроса: QWE	2026-11-06 19:32:10.858314
76	19	-1	Штраф за непрохождение опроса: QWE	2026-11-06 19:32:10.859314
77	15	-1	Штраф за непрохождение опроса: QWE	2026-11-06 19:32:10.860313
78	17	-1	Штраф за непрохождение опроса: QWE	2026-11-06 19:32:10.860313
79	5	-1	Штраф за непрохождение опроса: Опрос удовлетворенности	2026-11-06 19:32:10.868314
80	6	-1	Штраф за непрохождение опроса: Опрос удовлетворенности	2026-11-06 19:32:10.869313
81	7	-1	Штраф за непрохождение опроса: Опрос удовлетворенности	2026-11-06 19:32:10.870314
82	9	-1	Штраф за непрохождение опроса: Опрос удовлетворенности	2026-11-06 19:32:10.871313
83	19	-1	Штраф за непрохождение опроса: Опрос удовлетворенности	2026-11-06 19:32:10.872314
84	15	-1	Штраф за непрохождение опроса: Опрос удовлетворенности	2026-11-06 19:32:10.873314
85	17	-1	Штраф за непрохождение опроса: Опрос удовлетворенности	2026-11-06 19:32:10.874315
86	5	-1	Штраф за непрохождение опроса: Опрос 1	2026-11-06 19:32:10.880315
87	6	-1	Штраф за непрохождение опроса: Опрос 1	2026-11-06 19:32:10.882314
88	7	-1	Штраф за непрохождение опроса: Опрос 1	2026-11-06 19:32:10.883313
89	9	-1	Штраф за непрохождение опроса: Опрос 1	2026-11-06 19:32:10.884313
90	20	-1	Штраф за непрохождение опроса: Опрос 1	2026-11-06 19:32:10.886313
91	19	-1	Штраф за непрохождение опроса: Опрос 1	2026-11-06 19:32:10.887314
92	15	-1	Штраф за непрохождение опроса: Опрос 1	2026-11-06 19:32:10.889317
93	17	-1	Штраф за непрохождение опроса: Опрос 1	2026-11-06 19:32:10.890315
94	12	2	Награда за квест: Пройти курс по Java	2026-11-06 20:37:03.454398
95	1	-2	Штраф от Анна Фронтендова. Причина: йцу	2026-11-06 20:39:35.106932
96	2	2	Прохождение опроса: Тест	2026-11-06 20:46:35.131307
97	20	5	Награда за квест: Организовать митап	2026-11-06 20:47:18.924025
98	20	1	Награда за событие #8: Пятничный покер	2026-11-11 21:52:47.985119
99	8	1	Награда за событие #13: Тест 	2026-11-11 21:52:48.129399
\.


--
-- TOC entry 5419 (class 0 OID 74718)
-- Dependencies: 254
-- Data for Name: season_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.season_results (id, created_at, final_rating, place, reward_coins, user_id, user_name, season_id) FROM stdin;
1	2026-10-26 10:29:10.770602	150	1	5000.00	5	Петр Кодеров	1
2	2026-10-26 10:29:10.770602	120	2	2500.00	6	Мария Верстальщикова	1
3	2026-07-31 13:37:19.941227	45	1	7000.00	12	Сотрудник 12	4
4	2026-07-31 13:37:19.941227	32.5	2	4000.00	20	Сотрудник 20	4
5	2026-10-29 13:38:23.193757	50	1	7000.00	1	Сергей Админов	3
6	2026-10-29 13:38:23.208267	43	2	4000.00	5	Петр Кодеров	3
7	2026-10-29 13:38:23.212777	30	3	3000.00	2	Ольга HR	3
\.


--
-- TOC entry 5451 (class 0 OID 75759)
-- Dependencies: 286
-- Data for Name: shop_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shop_audit_logs (id, action, actor_id, actor_name, product_id, product_name, order_id, details, created_at, quantity_delta) FROM stdin;
1	PRODUCT_CREATED	1	Сергей Админов	6	Test Product 1793039848635_195	\N	Создан товар: Test Product 1793039848635_195	2026-10-26 21:37:29.665363	\N
2	DISCOUNT_CREATED	1	Сергей Админов	6	Test Product 1793039848635_195	\N	Скидка 20% до 2026-10-27T18:37:29.693	2026-10-26 21:37:29.720923	\N
3	STOCK_WRITTEN_OFF	1	Сергей Админов	6	Test Product 1793039848635_195	\N	Списано 1 шт. Причина: GIFT. Получатель: Test Employee	2026-10-26 21:37:29.83839	\N
4	PRODUCT_CREATED	1	Сергей Админов	7	Test Product 1793039916022_718	\N	Создан товар: Test Product 1793039916022_718	2026-10-26 21:38:36.764913	\N
5	DISCOUNT_CREATED	1	Сергей Админов	7	Test Product 1793039916022_718	\N	Скидка 20% до 2026-10-27T18:38:36.801	2026-10-26 21:38:36.815208	\N
6	STOCK_WRITTEN_OFF	1	Сергей Админов	7	Test Product 1793039916022_718	\N	Списано 1 шт. Причина: GIFT. Получатель: Test Employee	2026-10-26 21:38:36.91124	\N
7	PRODUCT_CREATED	1	Сергей Админов	8	Test Product 1793040137732_595	\N	Создан товар: Test Product 1793040137732_595	2026-10-26 21:42:18.644971	\N
8	DISCOUNT_CREATED	1	Сергей Админов	8	Test Product 1793040137732_595	\N	Скидка 20% до 2026-10-27T18:42:18.662	2026-10-26 21:42:18.674473	\N
9	STOCK_WRITTEN_OFF	1	Сергей Админов	8	Test Product 1793040137732_595	\N	Списано 1 шт. Причина: GIFT. Получатель: Test Employee	2026-10-26 21:42:18.796758	\N
10	PRODUCT_UPDATED	1	Сергей Админов	7	Test Product 1793039916022_718	\N	Обновлен товар: Test Product 1793039916022_718	2026-10-27 10:54:26.16532	\N
11	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Мерч	2026-10-27 10:58:39.535513	\N
12	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Обучение	2026-10-27 10:59:02.038295	\N
13	PRODUCT_DELETED	1	Сергей Админов	8	Test Product 1793040137732_595	\N	Товар скрыт: Test Product 1793040137732_595	2026-10-27 10:59:32.445507	\N
14	PRODUCT_RESTOCKED	1	Сергей Админов	6	Test Product 1793039848635_195	\N	Пополнение: +10 шт. Новый остаток: 18 шт.	2026-10-27 11:23:45.071684	10
15	ORDER_COMPLETED	1	Сергей Админов	4	Отгул на полдня	2	Заказ #2 завершен (выдан)	2026-10-27 11:24:08.538018	\N
16	ORDER_APPROVED	1	Сергей Админов	1	Кружка	1	Заказ #1 одобрен	2026-10-27 11:24:13.153089	\N
17	PRODUCT_UPDATED	1	Сергей Админов	2	Худи	\N	Обновлен товар: Худи	2026-10-27 11:26:30.811903	\N
18	PRODUCT_UPDATED	1	Сергей Админов	5	Кружка	\N	Обновлен товар: Кружка	2026-10-27 11:27:18.288268	\N
19	PRODUCT_UPDATED	1	Сергей Админов	5	Кружка	\N	Обновлен товар: Кружка	2026-10-27 11:27:27.746288	\N
20	PRODUCT_UPDATED	1	Сергей Админов	5	Кружка	\N	Обновлен товар: Кружка	2026-10-27 11:27:32.563355	\N
21	PRODUCT_UPDATED	1	Сергей Админов	5	Кружка	\N	Обновлен товар: Кружка	2026-10-27 11:27:39.223325	\N
22	DISCOUNT_DELETED	1	Сергей Админов	7	Test Product 1793039916022_718	\N	Удалена скидка 20%	2026-10-27 11:34:12.939426	\N
23	PRODUCT_DELETED	1	Сергей Админов	7	Test Product 1793039916022_718	\N	Товар скрыт: Test Product 1793039916022_718	2026-10-27 11:38:05.802012	\N
24	ORDER_COMPLETED	1	Сергей Админов	1	Кружка	1	Заказ #1 завершен (выдан)	2026-10-27 11:38:35.18573	\N
25	PRODUCT_RESTOCKED	1	Сергей Админов	5	Кружка	\N	Пополнение: +10 шт. Новый остаток: 20 шт.	2026-10-27 11:38:50.719106	10
26	STOCK_WRITTEN_OFF	1	Сергей Админов	5	Кружка	\N	Списание: −1 шт. Причина: GIFT. Новый остаток: 19 шт.	2026-10-27 11:39:07.277103	-1
27	PRODUCT_SOLD	1	Сергей Админов	2	Худи	6	Покупка: 1 шт. Заказ #6. Новый остаток: 4 шт.	2026-10-28 19:01:26.258773	-1
28	ORDER_APPROVED	1	Сергей Админов	6	Test Product 1793039848635_195	5	Заказ #5 одобрен	2026-10-28 19:01:35.05523	\N
29	ORDER_APPROVED	1	Сергей Админов	2	Худи	6	Заказ #6 одобрен	2026-10-28 19:01:36.018447	\N
30	ORDER_COMPLETED	1	Сергей Админов	2	Худи	6	Заказ #6 завершен (выдан)	2026-10-28 19:01:38.011423	\N
31	ORDER_COMPLETED	1	Сергей Админов	6	Test Product 1793039848635_195	5	Заказ #5 завершен (выдан)	2026-10-28 19:01:38.746553	\N
32	STOCK_WRITTEN_OFF	1	Сергей Админов	5	Кружка	\N	Списание: −19 шт. Причина: GIFT. Новый остаток: 0 шт.	2026-10-28 19:47:14.281943	-19
33	STOCK_WRITTEN_OFF	1	Сергей Админов	2	Худи	\N	Списание: −1 шт. Причина: GIFT. Новый остаток: 3 шт.	2026-10-28 21:23:17.981139	-1
34	PRODUCT_UPDATED	1	Сергей Админов	1	Кружка	\N	Обновлен товар: Кружка	2026-10-28 22:22:47.639176	\N
35	PRODUCT_UPDATED	1	Сергей Админов	2	Худи	\N	Обновлен товар: Худи	2026-10-28 22:23:04.172795	\N
36	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Test Category 1793039848635_195	2026-10-29 13:35:20.22399	\N
37	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Test Category 1793040137732_595	2026-10-29 13:35:24.7218	\N
38	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Test Category 1793039916022_718	2026-10-29 13:35:27.854232	\N
39	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Мерч	2026-10-29 22:40:26.689325	\N
40	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Мерч	2026-10-29 22:40:34.785211	\N
41	PRODUCT_DELETED	1	Сергей Админов	2	Худи	\N	Товар скрыт: Худи	2026-10-29 22:41:02.757147	\N
42	PRODUCT_HARD_DELETED	1	Сергей Админов	8	Test Product 1793040137732_595	\N	Товар удален навсегда: Test Product 1793040137732_595	2026-10-29 22:52:37.959949	\N
43	PRODUCT_HARD_DELETED	1	Сергей Админов	29	Аквапарк	\N	Товар удален навсегда: Аквапарк	2026-10-29 23:03:49.420174	\N
44	ORDER_COMPLETED	1	Сергей Админов	30	Отгул	9	Заказ #9 завершен (выдан)	2026-10-29 23:03:55.197094	\N
45	ORDER_APPROVED	1	Сергей Админов	22	Чашка	8	Заказ #8 одобрен	2026-10-29 23:03:56.608423	\N
46	ORDER_COMPLETED	1	Сергей Админов	22	Чашка	8	Заказ #8 завершен (выдан)	2026-10-29 23:03:57.393458	\N
47	PRODUCT_DELETED	1	Сергей Админов	30	Отгул	\N	Товар скрыт: Отгул	2026-10-29 23:04:16.713948	\N
48	PRODUCT_HARD_DELETED	1	Сергей Админов	28	Каток	\N	Товар удален навсегда: Каток	2026-10-29 23:04:19.807019	\N
49	PRODUCT_HARD_DELETED	1	Сергей Админов	27	Кинотеатр	\N	Товар удален навсегда: Кинотеатр	2026-10-29 23:04:21.062649	\N
50	PRODUCT_HARD_DELETED	1	Сергей Админов	26	Кофе	\N	Товар удален навсегда: Кофе	2026-10-29 23:04:22.371369	\N
51	PRODUCT_HARD_DELETED	1	Сергей Админов	25	Обед	\N	Товар удален навсегда: Обед	2026-10-29 23:04:23.943087	\N
52	PRODUCT_HARD_DELETED	1	Сергей Админов	24	Термобутылки	\N	Товар удален навсегда: Термобутылки	2026-10-29 23:04:25.475212	\N
53	PRODUCT_HARD_DELETED	1	Сергей Админов	23	Термокружки	\N	Товар удален навсегда: Термокружки	2026-10-29 23:04:26.725934	\N
54	PRODUCT_DELETED	1	Сергей Админов	22	Чашка	\N	Товар скрыт: Чашка	2026-10-29 23:04:30.867047	\N
55	PRODUCT_HARD_DELETED	1	Сергей Админов	21	Бутылка спортивная	\N	Товар удален навсегда: Бутылка спортивная	2026-10-29 23:04:32.178949	\N
56	PRODUCT_HARD_DELETED	1	Сергей Админов	20	Значки	\N	Товар удален навсегда: Значки	2026-10-29 23:04:34.025843	\N
57	PRODUCT_HARD_DELETED	1	Сергей Админов	19	Ручка	\N	Товар удален навсегда: Ручка	2026-10-29 23:04:35.481643	\N
58	PRODUCT_HARD_DELETED	1	Сергей Админов	18	Блокнот	\N	Товар удален навсегда: Блокнот	2026-10-29 23:04:36.96369	\N
59	PRODUCT_HARD_DELETED	1	Сергей Админов	17	Павербанк	\N	Товар удален навсегда: Павербанк	2026-10-29 23:04:39.776754	\N
60	PRODUCT_HARD_DELETED	1	Сергей Админов	16	Беспроводная зарядка	\N	Товар удален навсегда: Беспроводная зарядка	2026-10-29 23:04:41.336908	\N
61	PRODUCT_HARD_DELETED	1	Сергей Админов	15	USB-флешка 128гб	\N	Товар удален навсегда: USB-флешка 128гб	2026-10-29 23:04:42.763423	\N
62	PRODUCT_HARD_DELETED	1	Сергей Админов	14	Мышка	\N	Товар удален навсегда: Мышка	2026-10-29 23:04:44.025172	\N
63	PRODUCT_DELETED	1	Сергей Админов	13	Клавиатура	\N	Товар скрыт: Клавиатура	2026-10-29 23:04:52.032509	\N
64	PRODUCT_HARD_DELETED	1	Сергей Админов	12	Наушники	\N	Товар удален навсегда: Наушники	2026-10-29 23:04:53.214678	\N
65	PRODUCT_HARD_DELETED	1	Сергей Админов	9	Шопер	\N	Товар удален навсегда: Шопер	2026-10-29 23:04:54.74305	\N
66	PRODUCT_DELETED	1	Сергей Админов	1	Кружка	\N	Товар скрыт: Кружка	2026-10-29 23:04:57.869901	\N
67	PRODUCT_HARD_DELETED	1	Сергей Админов	5	Кружка	\N	Товар удален навсегда: Кружка	2026-10-29 23:04:59.202734	\N
68	PRODUCT_DELETED	1	Сергей Админов	6	Test Product 1793039848635_195	\N	Товар скрыт: Test Product 1793039848635_195	2026-10-29 23:05:02.445083	\N
69	PRODUCT_HARD_DELETED	1	Сергей Админов	11	Футболка	\N	Товар удален навсегда: Футболка	2026-10-29 23:05:04.143645	\N
70	PRODUCT_HARD_DELETED	1	Сергей Админов	10	Свитшот	\N	Товар удален навсегда: Свитшот	2026-10-29 23:05:05.617107	\N
71	PRODUCT_DELETED	1	Сергей Админов	4	Отгул на полдня	\N	Товар скрыт: Отгул на полдня	2026-10-29 23:05:08.486093	\N
72	PRODUCT_DELETED	1	Сергей Админов	3	Курс по Java	\N	Товар скрыт: Курс по Java	2026-10-29 23:05:11.62728	\N
73	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Текстиль	2026-10-29 23:05:18.634942	\N
74	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Мерч (товаров отвязано: 2)	2026-10-29 23:07:32.408031	\N
75	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Обучение (товаров отвязано: 1)	2026-10-29 23:07:38.720504	\N
76	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Гаджеты (товаров отвязано: 1)	2026-10-29 23:07:47.868993	\N
77	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Отгулы (товаров отвязано: 1)	2026-10-29 23:07:50.23487	\N
78	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Аксессуары (товаров отвязано: 0)	2026-10-29 23:07:52.470653	\N
79	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Бутылки и кружки (товаров отвязано: 1)	2026-10-29 23:07:56.112764	\N
80	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Еда (товаров отвязано: 0)	2026-10-29 23:07:58.087303	\N
81	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Отдых (товаров отвязано: 1)	2026-10-29 23:08:00.479105	\N
82	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Test Category 1793039848635_195 (товаров отвязано: 1)	2026-10-29 23:08:02.464787	\N
83	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Test Category 1793040137732_595 (товаров отвязано: 0)	2026-10-29 23:08:04.377956	\N
88	PRODUCT_SOLD	1	Сергей Админов	31	Футболка	11	Покупка: 1 шт. Заказ #11. Новый остаток: 9 шт.	2026-10-29 23:21:54.460912	-1
84	CATEGORY_DELETED	1	Сергей Админов	\N	\N	\N	Удалена категория: Test Category 1793039916022_718 (товаров отвязано: 1)	2026-10-29 23:08:06.263356	\N
85	CATEGORY_CREATED	1	Сергей Админов	\N	\N	\N	Создана категория: Текстиль	2026-10-29 23:14:04.747891	\N
86	PRODUCT_CREATED	1	Сергей Админов	31	Футболка	\N	Создан товар: Футболка, начальный остаток: 0 шт.	2026-10-29 23:17:47.777665	0
87	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:18:11.38288	10
89	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:28:27.046948	\N
90	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:33:46.583214	\N
91	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:34:49.631255	\N
92	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:37:17.45577	\N
93	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:41:39.852416	\N
94	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:41:46.383098	\N
95	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:44:38.613717	\N
96	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:44:51.242542	\N
97	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:48:47.980928	\N
98	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-29 23:49:23.552942	\N
99	PRODUCT_CREATED	1	Сергей Админов	32	Футболка	\N	Создан товар: Футболка, начальный остаток: 42 шт.	2026-10-29 23:53:19.520359	42
100	PRODUCT_CREATED	1	Сергей Админов	33	Худи	\N	Создан товар: Худи, начальный остаток: 51 шт.	2026-10-29 23:55:10.722489	51
101	PRODUCT_UPDATED	1	Сергей Админов	33	Худи	\N	Обновлен товар: Худи	2026-10-29 23:58:41.475341	\N
102	PRODUCT_CREATED	1	Сергей Админов	34	Худи	\N	Создан товар: Худи, начальный остаток: 48 шт.	2026-10-29 23:59:50.295326	48
103	PRODUCT_CREATED	1	Сергей Админов	35	Свитшот	\N	Создан товар: Свитшот, начальный остаток: 18 шт.	2026-10-30 00:01:12.601234	18
104	PRODUCT_CREATED	1	Сергей Админов	36	Шопер	\N	Создан товар: Шопер, начальный остаток: 0 шт.	2026-10-30 00:02:17.357005	0
105	PRODUCT_UPDATED	1	Сергей Админов	36	Шопер	\N	Обновлен товар: Шопер	2026-10-30 00:04:14.84479	12
106	PRODUCT_CREATED	1	Сергей Админов	37	Бейсболка	\N	Создан товар: Бейсболка, начальный остаток: 15 шт.	2026-10-30 00:05:06.752573	15
107	CATEGORY_CREATED	1	Сергей Админов	\N	\N	\N	Создана категория: Гаджеты	2026-10-30 00:08:43.359959	\N
108	PRODUCT_CREATED	1	Сергей Админов	38	Повербанк	\N	Создан товар: Повербанк, начальный остаток: 7 шт.	2026-10-30 00:09:22.011346	7
109	PRODUCT_CREATED	1	Сергей Админов	39	Беспроводная зарядка	\N	Создан товар: Беспроводная зарядка, начальный остаток: 5 шт.	2026-10-30 00:10:22.660579	5
110	PRODUCT_CREATED	1	Сергей Админов	40	USB-флешка	\N	Создан товар: USB-флешка, начальный остаток: 22 шт.	2026-10-30 00:12:44.972021	22
111	PRODUCT_CREATED	1	Сергей Админов	41	Мышка	\N	Создан товар: Мышка, начальный остаток: 31 шт.	2026-10-30 00:18:53.540801	31
112	PRODUCT_CREATED	1	Сергей Админов	42	Клавиатура	\N	Создан товар: Клавиатура, начальный остаток: 4 шт.	2026-10-30 00:19:53.829099	4
113	PRODUCT_CREATED	1	Сергей Админов	43	Наушники	\N	Создан товар: Наушники, начальный остаток: 4 шт.	2026-10-30 00:20:30.307694	4
114	CATEGORY_CREATED	1	Сергей Админов	\N	\N	\N	Создана категория: Аксессуары	2026-10-30 00:23:20.334462	\N
115	PRODUCT_CREATED	1	Сергей Админов	44	Значок	\N	Создан товар: Значок, начальный остаток: 89 шт.	2026-10-30 00:24:11.018984	89
116	PRODUCT_CREATED	1	Сергей Админов	45	Ручка	\N	Создан товар: Ручка, начальный остаток: 56 шт.	2026-10-30 00:24:32.56258	56
117	PRODUCT_CREATED	1	Сергей Админов	46	Блокнот	\N	Создан товар: Блокнот, начальный остаток: 33 шт.	2026-10-30 00:24:58.766224	33
118	CATEGORY_CREATED	1	Сергей Админов	\N	\N	\N	Создана категория: Кружки и термокружки	2026-10-30 00:52:22.171633	\N
119	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Кружки и термокружки	2026-10-30 00:52:30.314181	\N
120	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Аксессуары	2026-10-30 00:52:34.306049	\N
121	CATEGORY_UPDATED	1	Сергей Админов	\N	\N	\N	Обновлена категория: Гаджеты	2026-10-30 00:52:37.619211	\N
122	CATEGORY_CREATED	1	Сергей Админов	\N	\N	\N	Создана категория: Отдых	2026-10-30 00:53:21.172372	\N
123	PRODUCT_CREATED	1	Сергей Админов	47	Отгул	\N	Создан товар: Отгул, начальный остаток: 999 шт.	2026-10-30 00:53:55.636979	999
124	PRODUCT_CREATED	1	Сергей Админов	48	Сертификат в аквапарк	\N	Создан товар: Сертификат в аквапарк, начальный остаток: 999 шт.	2026-10-30 00:54:43.625866	999
125	PRODUCT_CREATED	1	Сергей Админов	49	Сертификат на посещение катка	\N	Создан товар: Сертификат на посещение катка, начальный остаток: 0 шт.	2026-10-30 00:55:31.662102	0
126	PRODUCT_CREATED	1	Сергей Админов	50	Кружка	\N	Создан товар: Кружка, начальный остаток: 0 шт.	2026-10-30 00:55:56.528751	0
127	PRODUCT_CREATED	1	Сергей Админов	51	Бутылка спортивная	\N	Создан товар: Бутылка спортивная, начальный остаток: 0 шт.	2026-10-30 00:56:42.810755	0
129	PRODUCT_CREATED	1	Сергей Админов	52	Термокружка	\N	Создан товар: Термокружка, начальный остаток: 15 шт.	2026-10-30 00:58:21.79276	15
131	PRODUCT_UPDATED	1	Сергей Админов	50	Кружка	\N	Обновлен товар: Кружка	2026-10-30 00:58:58.822826	\N
128	PRODUCT_UPDATED	1	Сергей Админов	50	Кружка	\N	Обновлен товар: Кружка	2026-10-30 00:56:57.347213	11
130	PRODUCT_CREATED	1	Сергей Админов	53	Термобутылка	\N	Создан товар: Термобутылка, начальный остаток: 18 шт.	2026-10-30 00:58:40.198756	18
132	CATEGORY_CREATED	1	Сергей Админов	\N	\N	\N	Создана категория: Тест	2026-10-30 02:24:01.722428	\N
133	PRODUCT_CREATED	1	Сергей Админов	54	Товар 1	\N	Создан товар: Товар 1, начальный остаток: 21 шт.	2026-10-30 02:24:59.815569	21
134	DISCOUNT_CREATED	1	Сергей Админов	54	Товар 1	\N	Скидка 20% до 2026-11-05T23:25:17	2026-10-30 02:25:17.54691	\N
135	ORDER_APPROVED	1	Сергей Админов	31	Футболка	11	Заказ #11 одобрен	2026-10-30 02:28:05.720223	\N
136	ORDER_COMPLETED	1	Сергей Админов	31	Футболка	11	Заказ #11 завершен (выдан)	2026-10-30 02:28:09.342971	\N
137	PRODUCT_SOLD	1	Сергей Админов	34	Худи	12	Покупка: 1 шт. Заказ #12. Новый остаток: 47 шт.	2026-10-30 02:29:18.967961	-1
138	PRODUCT_SOLD	1	Сергей Админов	40	USB-флешка	13	Покупка: 2 шт. Заказ #13. Новый остаток: 20 шт.	2026-10-30 02:29:18.9747	-2
139	PRODUCT_SOLD	1	Сергей Админов	54	Товар 1	14	Покупка: 1 шт. Заказ #14. Новый остаток: 20 шт.	2026-10-30 02:29:18.979213	-1
140	ORDER_APPROVED	1	Сергей Админов	34	Худи	12	Заказ #12 одобрен	2026-10-30 02:29:33.54945	\N
141	ORDER_APPROVED	1	Сергей Админов	40	USB-флешка	13	Заказ #13 одобрен	2026-10-30 02:29:34.182493	\N
142	ORDER_APPROVED	1	Сергей Админов	54	Товар 1	14	Заказ #14 одобрен	2026-10-30 02:29:34.732731	\N
143	ORDER_COMPLETED	1	Сергей Админов	54	Товар 1	14	Заказ #14 завершен (выдан)	2026-10-30 02:29:36.028861	\N
144	ORDER_COMPLETED	1	Сергей Админов	40	USB-флешка	13	Заказ #13 завершен (выдан)	2026-10-30 02:29:36.963971	\N
145	ORDER_COMPLETED	1	Сергей Админов	34	Худи	12	Заказ #12 завершен (выдан)	2026-10-30 02:29:37.660041	\N
146	DISCOUNT_CREATED	1	Сергей Админов	32	Футболка	\N	Скидка 20% до 2026-11-06T05:27:42	2026-10-30 08:27:42.160555	\N
147	DISCOUNT_DELETED	1	Сергей Админов	32	Футболка	\N	Удалена скидка 20%	2026-10-30 08:28:01.234411	\N
148	DISCOUNT_CREATED	1	Сергей Админов	32	Футболка	\N	Скидка 32% до 2026-11-06T05:28:01	2026-10-30 08:28:01.326652	\N
149	DISCOUNT_DELETED	1	Сергей Админов	32	Футболка	\N	Удалена скидка 32%	2026-10-30 08:28:04.017412	\N
150	DISCOUNT_CREATED	1	Сергей Админов	32	Футболка	\N	Скидка 32% до 2026-11-06T05:28:04	2026-10-30 08:28:04.031081	\N
151	PRODUCT_UPDATED	1	Сергей Админов	49	Сертификат на посещение катка	\N	Обновлен товар: Сертификат на посещение катка	2026-10-30 08:37:55.920726	123
152	DISCOUNT_CREATED	1	Сергей Админов	31	Футболка	\N	Скидка 20% до 2026-11-06T05:38:06	2026-10-30 08:38:06.488612	\N
153	PRODUCT_UPDATED	1	Сергей Админов	31	Футболка	\N	Обновлен товар: Футболка	2026-10-30 08:38:07.580123	\N
154	PRODUCT_CREATED	1	Сергей Админов	55	Название	\N	Создан товар: Название, начальный остаток: 28 шт.	2026-10-30 08:38:42.970772	28
155	PRODUCT_SOLD	1	Сергей Админов	49	Сертификат на посещение катка	15	Покупка: 2 шт. Заказ #15. Новый остаток: 121 шт.	2026-10-30 08:39:05.783315	-2
156	PRODUCT_SOLD	1	Сергей Админов	55	Название	16	Покупка: 1 шт. Заказ #16. Новый остаток: 27 шт.	2026-10-30 08:39:05.791043	-1
157	ORDER_APPROVED	1	Сергей Админов	49	Сертификат на посещение катка	15	Заказ #15 одобрен	2026-10-30 08:41:17.942983	\N
158	ORDER_APPROVED	1	Сергей Админов	55	Название	16	Заказ #16 одобрен	2026-10-30 08:41:18.57862	\N
159	ORDER_COMPLETED	1	Сергей Админов	49	Сертификат на посещение катка	15	Заказ #15 завершен (выдан)	2026-10-30 08:41:19.536242	\N
160	ORDER_COMPLETED	1	Сергей Админов	55	Название	16	Заказ #16 завершен (выдан)	2026-10-30 08:41:20.046878	\N
161	PRODUCT_RESTOCKED	1	Сергей Админов	50	Кружка	\N	Пополнение: +10 шт. Новый остаток: 21 шт.	2026-10-30 08:42:47.834079	10
162	STOCK_WRITTEN_OFF	1	Сергей Админов	50	Кружка	\N	Списание: −20 шт. Причина: GIFT. Новый остаток: 1 шт.	2026-10-30 08:42:55.682851	-20
163	CATEGORY_CREATED	1	Сергей Админов	\N	\N	\N	Создана категория: Категория	2026-10-30 08:43:13.953784	\N
164	PRODUCT_SOLD	12	EMPLOYEE 1793003360320_666	52	Термокружка	17	Покупка: 2 шт. Заказ #17. Новый остаток: 13 шт.	2026-10-30 08:49:08.161514	-2
165	PRODUCT_SOLD	20	Обычный пользователь	44	Значок	18	Покупка: 4 шт. Заказ #18. Новый остаток: 85 шт.	2026-11-06 20:32:07.41395	-4
166	PRODUCT_SOLD	20	Обычный пользователь	49	Сертификат на посещение катка	19	Покупка: 1 шт. Заказ #19. Новый остаток: 120 шт.	2026-11-06 20:32:07.441719	-1
167	PRODUCT_SOLD	20	Обычный пользователь	32	Футболка	20	Покупка: 1 шт. Заказ #20. Новый остаток: 41 шт.	2026-11-06 20:32:07.447358	-1
168	CATEGORY_CREATED	4	Анна Фронтендова	\N	\N	\N	Создана категория: Тест1	2026-11-06 20:37:38.020519	\N
169	PRODUCT_CREATED	4	Анна Фронтендова	56	ТЕст	\N	Создан товар: ТЕст, начальный остаток: 20 шт.	2026-11-06 20:38:43.268291	20
170	ORDER_APPROVED	2	Ольга HR	52	Термокружка	17	Заказ #17 одобрен	2026-11-06 20:45:05.485745	\N
171	ORDER_APPROVED	2	Ольга HR	44	Значок	18	Заказ #18 одобрен	2026-11-06 20:45:06.235797	\N
172	ORDER_APPROVED	2	Ольга HR	49	Сертификат на посещение катка	19	Заказ #19 одобрен	2026-11-06 20:45:07.207719	\N
173	ORDER_APPROVED	2	Ольга HR	32	Футболка	20	Заказ #20 одобрен	2026-11-06 20:45:08.243791	\N
174	ORDER_COMPLETED	2	Ольга HR	32	Футболка	20	Заказ #20 завершен (выдан)	2026-11-06 20:45:14.175974	\N
175	ORDER_COMPLETED	2	Ольга HR	49	Сертификат на посещение катка	19	Заказ #19 завершен (выдан)	2026-11-06 20:45:15.445825	\N
176	ORDER_COMPLETED	2	Ольга HR	44	Значок	18	Заказ #18 завершен (выдан)	2026-11-06 20:45:17.335995	\N
177	ORDER_COMPLETED	2	Ольга HR	52	Термокружка	17	Заказ #17 завершен (выдан)	2026-11-06 20:45:17.989675	\N
179	STOCK_WRITTEN_OFF	1	Сергей Админов	51	Бутылка спортивная	\N	Списание: −3 шт. Причина: DAMAGED. Комментарий: йцу. Новый остаток: 7 шт.	2026-11-06 20:59:51.213933	-3
180	PRODUCT_DELETED	1	Сергей Админов	51	Бутылка спортивная	\N	Товар скрыт: Бутылка спортивная	2026-11-06 21:00:04.444553	\N
178	PRODUCT_RESTOCKED	1	Сергей Админов	51	Бутылка спортивная	\N	Пополнение: +10 шт. Новый остаток: 10 шт.	2026-11-06 20:59:39.039955	10
\.


--
-- TOC entry 5453 (class 0 OID 75775)
-- Dependencies: 288
-- Data for Name: stock_write_offs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_write_offs (id, product_id, quantity, reason, recipient_id, recipient_name, actor_id, actor_name, comment, created_at) FROM stdin;
1	6	1	GIFT	15	Test Employee	1	Сергей Админов	Gift	2026-10-26 21:37:29.835236
2	7	1	GIFT	17	Test Employee	1	Сергей Админов	Gift	2026-10-26 21:38:36.910239
6	2	1	GIFT	\N	\N	1	Сергей Админов	\N	2026-10-28 21:23:17.977635
7	50	20	GIFT	\N	\N	1	Сергей Админов	\N	2026-10-30 08:42:55.638698
8	51	3	DAMAGED	\N	\N	1	Сергей Админов	йцу	2026-11-06 20:59:51.210933
\.


--
-- TOC entry 5431 (class 0 OID 74826)
-- Dependencies: 266
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_tickets (id, closed_at, created_at, description, rating, review_comment, status, topic, assignee_id, creator_id, is_quest_request) FROM stdin;
2	\N	2026-10-25 10:29:10.770602	Не могу зайти в почту	\N	\N	IN_PROGRESS	Забыл пароль	8	6	f
3	2026-10-22 10:29:10.770602	2026-10-21 10:29:10.770602	Нет прав к репозиторию	5	Быстро помогли!	COMPLETED	Проблема с доступом	8	7	f
4	\N	2026-10-26 11:29:20.708598	Here is my photo	\N	\N	IN_PROGRESS	Proof for quest 1793003360320_666	11	12	f
5	\N	2026-10-28 10:21:48.661613	уцй	\N	\N	IN_PROGRESS	йцу	1	1	f
6	2026-10-28 11:17:55.250026	2026-10-28 11:17:22.690076	123	\N	\N	COMPLETED	Квест	8	12	t
1	\N	2026-10-26 10:29:10.770602	Не могу подключиться	\N	\N	IN_PROGRESS	Не работает VPN	8	5	f
8	\N	2026-10-29 11:36:11.001986	Выполнил квест, но баланс не изменился	\N	\N	IN_PROGRESS	Не начисляются монеты	11	20	t
10	\N	2026-10-24 13:36:11.001986	Забыл пароль	\N	\N	COMPLETED	Проблема с входом	11	20	f
11	2026-10-30 02:28:41.247453	2026-10-30 02:27:11.336077	Примите квест	5		COMPLETED	Тест обращение	1	1	t
9	2026-10-30 02:33:34.196817	2026-10-28 13:36:11.001986	Не могу найти в магазине	\N	\N	COMPLETED	Как заказать худи?	8	12	f
7	2026-10-30 08:50:05.243405	2026-10-28 20:11:23.750085	Тест 1	\N	\N	COMPLETED	Тест 1	8	20	f
12	2026-10-30 08:50:28.381986	2026-10-30 08:40:11.922114	Примите квест пж	5		COMPLETED	Тест 1	8	1	t
13	2026-11-06 20:47:33.468482	2026-11-06 20:30:36.207473	Квест	\N	\N	COMPLETED	Примите квест	8	20	t
14	\N	2026-11-06 20:33:38.395497	йцу	\N	\N	IN_PROGRESS	арп	8	20	f
\.


--
-- TOC entry 5411 (class 0 OID 74568)
-- Dependencies: 246
-- Data for Name: surveys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.surveys (id, created_at, description, is_active, title, creator_id, deadline, reward_rating, penalty_rating) FROM stdin;
2	2026-10-26 10:29:10.770602	Прошедший опрос	f	Опрос Q3	2	2026-10-16 10:29:10.770602	2	-1
1	2026-10-26 10:29:10.770602	Ежеквартальный опрос	f	Опрос Q4	2	2026-11-05 10:29:10.770602	2	-1
3	2026-10-28 00:09:11.10656	Тест	f	Тест1	1	2026-11-03 21:08:00	2	-1
4	2026-10-28 00:12:38.398301		f	QWE	1	2026-11-03 21:12:00	2	-1
5	2026-10-27 13:37:16.098328	Насколько вам комфортно работать?	f	Опрос удовлетворенности	2	2026-11-03 13:37:16.098328	1	-1
6	2026-10-30 08:42:13.724925	Описание	f	Опрос 1	1	2026-11-06 05:41:00	2	-1
7	2026-11-06 20:46:05.65577	Тест	t	Тест	2	2026-11-13 17:45:00	2	-1
\.


--
-- TOC entry 5407 (class 0 OID 74547)
-- Dependencies: 242
-- Data for Name: survey_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_questions (id, text, survey_id) FROM stdin;
1	Как ваше настроение?	1
2	Оцените коллектив?	1
3	Было ли тяжело в Q3?	2
4	ТЕст1	3
5	Тест2	3
6	Тест3	3
7	1	4
8	Оцените атмосферу в коллективе от 1 до 5	5
9	Вопрос1	6
10	Вопрос2	6
11	Вопрос3	6
12	Тест1	7
13	Тест	7
14	Тест3	7
\.


--
-- TOC entry 5405 (class 0 OID 74537)
-- Dependencies: 240
-- Data for Name: survey_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_options (id, text, value, question_id) FROM stdin;
1	Отлично	5	1
2	Плохо	1	1
3	Дружный	5	2
4	Разрозненный	1	2
5	Да	5	3
6	Нет	1	3
7	1	1	4
8	2	2	4
9	3	3	4
10	3	1	5
11	2	2	5
12	1	3	5
13	2	1	6
14	1	2	6
15	3	3	6
16	23	1	7
17	3	2	7
18	Отлично	5	8
19	Хорошо	4	8
20	Плохо	2	8
21	1	1	9
22	2	2	9
23	1	1	10
24	2	2	10
25	1	1	11
26	2	2	11
27	1	1	12
28	2	2	12
29	3	3	12
30	3	1	13
31	2	2	13
32	1	3	13
33	ц	1	14
34	й	2	14
\.


--
-- TOC entry 5409 (class 0 OID 74556)
-- Dependencies: 244
-- Data for Name: survey_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_responses (id, answered_at, option_id, question_id, survey_id, user_id) FROM stdin;
1	2026-10-26 10:29:10.770602	1	1	1	5
2	2026-10-26 10:29:10.770602	3	2	1	5
3	2026-10-28 00:05:29.832895	1	1	1	12
4	2026-10-28 00:05:29.846406	3	2	1	12
5	2026-10-28 00:08:36.025061	1	1	1	1
6	2026-10-28 00:08:36.02706	4	2	1	1
7	2026-10-28 00:13:46.481555	9	4	3	1
8	2026-10-28 00:13:46.483063	11	5	3	1
9	2026-10-28 00:13:46.483063	15	6	3	1
10	2026-10-28 21:22:13.328159	17	7	4	1
11	2026-10-29 13:37:16.098328	18	8	5	20
12	2026-10-30 02:23:30.813411	18	8	5	1
13	2026-10-30 02:32:44.795834	7	4	3	12
14	2026-10-30 02:32:44.796834	10	5	3	12
15	2026-10-30 02:32:44.798863	13	6	3	12
16	2026-10-30 08:48:48.244742	16	7	4	12
17	2026-10-30 08:48:50.651449	18	8	5	12
18	2026-10-30 08:48:55.025919	21	9	6	12
19	2026-10-30 08:48:55.029946	23	10	6	12
20	2026-10-30 08:48:55.030424	25	11	6	12
21	2026-11-06 20:46:35.12928	27	12	7	2
22	2026-11-06 20:46:35.12928	30	13	7	2
23	2026-11-06 20:46:35.131307	34	14	7	2
\.


--
-- TOC entry 5413 (class 0 OID 74651)
-- Dependencies: 248
-- Data for Name: survey_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_templates (id, name, description, creator_id, created_at) FROM stdin;
\.


--
-- TOC entry 5415 (class 0 OID 74672)
-- Dependencies: 250
-- Data for Name: survey_template_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_template_questions (id, template_id, text) FROM stdin;
\.


--
-- TOC entry 5417 (class 0 OID 74689)
-- Dependencies: 252
-- Data for Name: survey_template_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_template_options (id, question_id, text, value) FROM stdin;
\.


--
-- TOC entry 5442 (class 0 OID 75523)
-- Dependencies: 277
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (setting_key, setting_value, category, description, label) FROM stdin;
test_setting_key	999	\N	\N	\N
limit.peer.daily	200	\N	\N	\N
limit.peer.per_recipient	50	\N	\N	\N
maintenance_mode	false	\N	\N	\N
limit.peer.daily-per-recipient	1000	Переводы	Максимум монет, которое можно перевести одному коллеге за день	Лимит на коллегу
limit.peer.daily-total	1000	Переводы	Максимум монет, которое можно перевести всем коллегам за день	Общий лимит переводов
limit.manager.daily-per-subordinate	2000	Переводы	Максимум монет, которое менеджер может начислить одному сотруднику за день	Лимит бонусов на сотрудника
limit.manager.daily-total	5000	Переводы	Максимум монет, которое менеджер может начислить всем сотрудникам за день	Общий лимит бонусов менеджера
economy.monthly-earn-limit	10000	Экономика	Максимум монет, которое сотрудник может заработать за месяц	Месячный лимит заработка
limit.quest.max-reward	5000	Экономика	Максимальное количество монет, которое можно назначить за один квест	Макс. награда за квест
limit.event.max-reward	2000	Экономика	Максимальное количество монет, которое можно назначить за одно событие	Макс. награда за событие
economy.treasury.auto-refill-amount	50000	Экономика	На сколько монет пополняется казна 1-го числа каждого месяца	Автопополнение казны (сумма)
economy.treasury.threshold	1000	Экономика	Если баланс казны опускается ниже этого числа, сработает автопополнение	Автопополнение казны (порог)
\.


--
-- TOC entry 5433 (class 0 OID 74841)
-- Dependencies: 268
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_messages (id, created_at, text, sender_id, ticket_id, attachment_url, reply_to_id, edited_at) FROM stdin;
1	2026-10-25 10:29:10.770602	Здравствуйте, не могу зайти	6	2	\N	\N	\N
2	2026-10-25 11:29:10.770602	Здравствуйте! Проверьте раскладку.	8	2	\N	\N	\N
3	2026-10-21 10:29:10.770602	Добрый день, не работает доступ	7	3	\N	\N	\N
4	2026-10-21 11:29:10.770602	Сейчас выдам права.	8	3	\N	\N	\N
5	2026-10-26 11:29:20.75869	Вот мое фото с пробежки!	12	4	http://localhost:8080/uploads/mock-photo.jpg	\N	\N
6	2026-10-28 11:17:25.608372	алеп	12	6	\N	\N	\N
7	2026-10-28 11:17:29.864048	прими квест	12	6	\N	\N	\N
8	2026-10-28 20:05:54.254564	hg	1	5	\N	\N	\N
9	2026-10-29 11:36:11.001986	Здравствуйте, квест выполнен, но монет нет.	20	8	\N	\N	\N
10	2026-10-29 12:36:11.001986	Добрый день! Проверяю статус квеста.	11	8	\N	\N	\N
11	2026-10-29 12:46:11.001986	Спасибо, жду.	20	8	\N	\N	\N
12	2026-10-28 13:36:11.001986	Подскажите, пожалуйста, где найти раздел с одеждой?	12	9	\N	\N	\N
13	2026-10-30 02:28:39.145098	ок	1	11	\N	\N	\N
14	2026-10-30 02:33:31.916359	не знаю	8	9	\N	\N	\N
15	2026-10-30 08:50:23.047879	выдал	8	12	\N	\N	\N
16	2026-11-06 20:30:47.381488	Тест	20	13	\N	\N	\N
17	2026-11-06 20:33:40.481289	йцу	20	14	\N	\N	\N
18	2026-11-06 20:34:07.671653		20	14	/uploads/f22a6aeb-2435-41a2-9863-2436bc1ba305.png	\N	\N
19	2026-11-06 20:47:11.97189	про	8	13	\N	\N	\N
20	2026-11-06 20:47:13.01207	фыв	8	13	\N	\N	\N
\.


--
-- TOC entry 5387 (class 0 OID 74193)
-- Dependencies: 222
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, amount, created_at, from_user_id, to_user_id) FROM stdin;
1	200.00	2026-10-16 09:17:55.928192	2	3
2	444.00	2026-10-16 23:41:41.522876	2	3
\.


--
-- TOC entry 5447 (class 0 OID 75723)
-- Dependencies: 282
-- Data for Name: treasury; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treasury (id, balance, last_funded_at) FROM stdin;
1	26178.00	2026-11-06 20:52:51.548019
\.


--
-- TOC entry 5457 (class 0 OID 75849)
-- Dependencies: 292
-- Data for Name: treasury_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treasury_transactions (id, actor_id, actor_name, amount, balance_after, created_at, description, type) FROM stdin;
1	\N	\N	300.00	48500.00	2026-10-28 11:17:50.862929	Выплата награды	REWARD_PAYOUT
2	1	Сергей Админов	1000.00	47500.00	2026-10-28 21:22:50.909693	Ручное списание	WITHDRAW
3	\N	\N	1000.00	48500.00	2026-10-28 21:22:52.463667	Пополнение казны	FUND
4	1	Админ	100000.00	100000.00	2026-09-29 13:37:12.011699	Стартовое пополнение	FUND
5	\N	\N	1000.00	99000.00	2026-10-28 13:37:12.011699	Награда за квест	REWARD_PAYOUT
6	\N	\N	400.00	98600.00	2026-10-24 13:37:12.011699	Награда за событие	REWARD_PAYOUT
7	\N	\N	100.00	98700.00	2026-10-29 20:58:27.972767	Пополнение казны	FUND
8	1	Сергей Админов	50000.00	48700.00	2026-10-29 21:37:26.142962	Ручное списание	WITHDRAW
9	\N	\N	2000.00	46700.00	2026-10-29 21:38:42.212202	Выплата награды	REWARD_PAYOUT
10	\N	\N	2000.00	44700.00	2026-10-29 21:38:50.187037	Выплата награды	REWARD_PAYOUT
11	\N	\N	2000.00	42700.00	2026-10-29 21:38:58.207095	Выплата награды	REWARD_PAYOUT
12	\N	\N	2000.00	40700.00	2026-10-29 21:39:05.869098	Выплата награды	REWARD_PAYOUT
13	\N	\N	2000.00	38700.00	2026-10-29 21:39:26.430456	Выплата награды	REWARD_PAYOUT
14	\N	\N	2000.00	36700.00	2026-10-29 21:39:33.454372	Выплата награды	REWARD_PAYOUT
15	\N	\N	2000.00	34700.00	2026-10-29 21:39:39.884593	Выплата награды	REWARD_PAYOUT
16	\N	\N	2000.00	32700.00	2026-10-29 21:39:50.456902	Выплата награды	REWARD_PAYOUT
17	\N	\N	1111.00	33811.00	2026-10-29 21:44:22.459488	Пополнение казны	FUND
18	\N	\N	500.00	34311.00	2026-10-30 01:02:07.750191	Пополнение казны	FUND
19	\N	\N	100.00	34211.00	2026-10-30 02:26:01.867707	Выплата награды	REWARD_PAYOUT
20	\N	\N	2000.00	32211.00	2026-10-30 02:29:01.861572	Выплата награды	REWARD_PAYOUT
21	\N	\N	500.00	32711.00	2026-10-30 02:30:10.728745	Штраф с Петр Кодеров. Причина: Нарушение	PENALTY_RETURN
22	\N	\N	1000.00	33711.00	2026-10-30 02:31:15.435334	Пополнение казны	FUND
23	1	Сергей Админов	1000.00	32711.00	2026-10-30 02:31:17.674727	Ручное списание	WITHDRAW
24	\N	\N	500.00	32211.00	2026-10-30 08:39:19.998717	Выплата награды	REWARD_PAYOUT
25	\N	\N	133.00	32344.00	2026-10-30 08:44:00.530479	Штраф с EMPLOYEE 1793003360320_666. Причина: почему бы и нет\n	PENALTY_RETURN
26	\N	\N	300.00	32044.00	2026-10-30 08:44:11.748081	Выплата награды	REWARD_PAYOUT
27	\N	\N	300.00	32344.00	2026-10-30 08:45:42.516549	Пополнение казны	FUND
28	\N	\N	1000.00	33344.00	2026-10-30 08:45:53.765635	Пополнение казны	FUND
29	1	Сергей Админов	1000.00	32344.00	2026-10-30 08:45:56.825366	Ручное списание	WITHDRAW
30	\N	\N	100.00	32244.00	2026-10-30 08:49:44.345449	Выплата награды	REWARD_PAYOUT
31	\N	\N	1000.00	31244.00	2026-10-30 08:50:24.305578	Выплата награды	REWARD_PAYOUT
32	\N	\N	1500.00	29744.00	2026-11-06 19:32:10.661311	Выплата награды	REWARD_PAYOUT
33	\N	\N	100.00	29644.00	2026-11-06 19:32:10.727313	Выплата награды	REWARD_PAYOUT
34	\N	\N	1000.00	28644.00	2026-11-06 20:37:03.451393	Выплата награды	REWARD_PAYOUT
35	\N	\N	111.00	28755.00	2026-11-06 20:39:35.103361	Штраф с Сергей Админов. Причина: йцу	PENALTY_RETURN
36	\N	\N	500.00	28255.00	2026-11-06 20:47:18.110075	Выплата награды	REWARD_PAYOUT
37	\N	\N	2000.00	26255.00	2026-11-06 20:47:18.922019	Выплата награды	REWARD_PAYOUT
38	\N	\N	1000.00	27255.00	2026-11-06 20:52:16.130072	Пополнение казны	FUND
39	1	Сергей Админов	1000.00	26255.00	2026-11-06 20:52:19.224937	Ручное списание	WITHDRAW
40	\N	\N	123.00	26378.00	2026-11-06 20:52:51.548019	Штраф с Мария Верстальщикова. Причина: йцу	PENALTY_RETURN
41	\N	\N	100.00	26278.00	2026-11-11 21:52:47.900985	Выплата награды	REWARD_PAYOUT
42	\N	\N	100.00	26178.00	2026-11-11 21:52:48.127399	Выплата награды	REWARD_PAYOUT
\.


--
-- TOC entry 5403 (class 0 OID 74513)
-- Dependencies: 238
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_achievements (id, earned_at, achievement_id, user_id) FROM stdin;
1	2026-10-16 10:29:10.770602	1	5
2	2026-10-26 11:29:20.847422	1	12
3	2026-10-27 13:37:16.098328	1	20
4	2026-10-22 13:37:16.098328	7	12
5	2026-10-28 13:37:16.098328	10	20
6	2026-10-29 13:38:23.204267	4	1
7	2026-10-29 13:38:23.207267	5	1
8	2026-10-29 13:38:23.211772	5	5
9	2026-10-29 13:38:23.214777	5	2
10	2026-10-29 13:38:23.301756	6	5
11	2026-10-29 13:38:23.305329	8	3
12	2026-10-29 13:38:23.311111	6	4
13	2026-10-29 13:38:23.315615	8	6
14	2026-10-29 13:38:23.31913	6	8
15	2026-10-29 13:38:23.323131	6	7
16	2026-10-29 13:38:23.32613	6	9
17	2026-10-29 21:38:08.677571	11	3
18	2026-10-30 02:26:11.817168	10	7
19	2026-10-30 08:35:29.371008	1	1
20	2026-10-30 08:39:27.103906	7	4
\.


--
-- TOC entry 5437 (class 0 OID 74894)
-- Dependencies: 272
-- Data for Name: user_quests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_quests (id, admin_comment, completed_at, started_at, status, submitted_at, quest_id, user_id) FROM stdin;
1	\N	\N	2026-10-26 10:29:10.770602	IN_PROGRESS	\N	1	5
3	\N	\N	2026-10-21 10:29:10.770602	COMPLETED	2026-10-22 10:29:10.770602	3	9
4	\N	2026-10-27 10:37:47.210732	2026-10-27 10:37:20.238639	COMPLETED	2026-10-27 10:37:23.941748	3	12
5	\N	2026-10-27 11:38:30.274273	2026-10-27 11:35:40.071015	COMPLETED	2026-10-27 11:35:43.451276	1	12
7	\N	2026-10-28 11:17:50.864933	2026-10-28 11:17:04.453173	COMPLETED	2026-10-28 11:17:06.508005	2	12
8	Отлично!	2026-10-28 13:35:35.67781	2026-10-24 13:35:35.67781	COMPLETED	2026-10-27 13:35:35.67781	4	20
10	\N	\N	2026-10-28 13:35:35.67781	IN_PROGRESS	\N	4	14
11	\N	2026-10-22 13:35:35.67781	2026-10-19 13:35:35.67781	COMPLETED	2026-10-21 13:35:35.67781	5	12
12	\N	\N	2026-10-29 13:35:35.67781	IN_PROGRESS	\N	7	14
14	Недостаточно доказательств	\N	2026-10-27 13:35:35.67781	REJECTED	2026-10-28 13:35:35.67781	8	20
16	\N	\N	2026-10-30 02:27:18.289471	IN_PROGRESS	\N	9	1
15	\N	2026-10-30 02:29:01.863087	2026-10-30 02:23:14.493518	COMPLETED	2026-10-30 02:23:20.564714	5	1
6	\N	2026-10-30 08:44:11.748081	2026-10-28 00:18:27.475218	COMPLETED	2026-10-28 00:18:30.49348	2	1
18	\N	2026-10-30 08:49:44.345449	2026-10-30 08:46:44.099919	COMPLETED	2026-10-30 08:48:41.031256	10	12
17	\N	2026-10-30 08:50:24.307583	2026-10-30 08:37:34.296536	COMPLETED	2026-10-30 08:37:36.685105	4	1
20	\N	\N	2026-11-06 20:36:54.243275	IN_PROGRESS	\N	11	3
21	\N	\N	2026-11-06 20:36:54.24528	IN_PROGRESS	\N	11	5
22	\N	\N	2026-11-06 20:36:54.246621	IN_PROGRESS	\N	11	6
23	\N	\N	2026-11-06 20:36:54.246621	IN_PROGRESS	\N	11	7
24	\N	\N	2026-11-06 20:36:54.248845	IN_PROGRESS	\N	11	13
9	\N	2026-11-06 20:37:03.453398	2026-10-26 13:35:35.67781	COMPLETED	2026-10-29 12:35:35.67781	4	12
2	йцу	\N	2026-10-24 10:29:10.770602	REJECTED	2026-10-26 10:29:10.770602	2	6
13	\N	2026-11-06 20:47:18.112082	2026-10-29 13:35:35.67781	COMPLETED	2026-10-29 13:42:44.484852	7	20
19	\N	2026-11-06 20:47:18.924026	2026-11-06 20:30:12.919013	COMPLETED	2026-11-06 20:30:16.16538	5	20
25	\N	\N	2026-11-11 21:58:31.967238	PENDING_REVIEW	2026-11-11 21:58:34.578992	6	1
\.


--
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 235
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.achievements_id_seq', 12, true);


--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 233
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 20, true);


--
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 278
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 25, true);


--
-- TOC entry 5471 (class 0 OID 0)
-- Dependencies: 280
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_id_seq', 7, true);


--
-- TOC entry 5472 (class 0 OID 0)
-- Dependencies: 227
-- Name: coin_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coin_transactions_id_seq', 103, true);


--
-- TOC entry 5473 (class 0 OID 0)
-- Dependencies: 259
-- Name: department_member_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.department_member_results_id_seq', 10, true);


--
-- TOC entry 5474 (class 0 OID 0)
-- Dependencies: 261
-- Name: department_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.department_results_id_seq', 7, true);


--
-- TOC entry 5475 (class 0 OID 0)
-- Dependencies: 263
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 5, true);


--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 283
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discounts_id_seq', 8, true);


--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 225
-- Name: event_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_participants_id_seq', 23, true);


--
-- TOC entry 5478 (class 0 OID 0)
-- Dependencies: 223
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 13, true);


--
-- TOC entry 5479 (class 0 OID 0)
-- Dependencies: 273
-- Name: favorite_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorite_products_id_seq', 7, true);


--
-- TOC entry 5480 (class 0 OID 0)
-- Dependencies: 293
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_id_seq', 10, true);


--
-- TOC entry 5481 (class 0 OID 0)
-- Dependencies: 295
-- Name: news_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_ratings_id_seq', 12, true);


--
-- TOC entry 5482 (class 0 OID 0)
-- Dependencies: 231
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 20, true);


--
-- TOC entry 5483 (class 0 OID 0)
-- Dependencies: 275
-- Name: product_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_reviews_id_seq', 1, false);


--
-- TOC entry 5484 (class 0 OID 0)
-- Dependencies: 289
-- Name: product_variants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_variants_id_seq', 188, true);


--
-- TOC entry 5485 (class 0 OID 0)
-- Dependencies: 229
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 56, true);


--
-- TOC entry 5486 (class 0 OID 0)
-- Dependencies: 269
-- Name: quests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quests_id_seq', 11, true);


--
-- TOC entry 5487 (class 0 OID 0)
-- Dependencies: 257
-- Name: rating_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rating_transactions_id_seq', 99, true);


--
-- TOC entry 5488 (class 0 OID 0)
-- Dependencies: 253
-- Name: season_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.season_results_id_seq', 7, true);


--
-- TOC entry 5489 (class 0 OID 0)
-- Dependencies: 255
-- Name: seasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seasons_id_seq', 5, true);


--
-- TOC entry 5490 (class 0 OID 0)
-- Dependencies: 285
-- Name: shop_audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shop_audit_logs_id_seq', 180, true);


--
-- TOC entry 5491 (class 0 OID 0)
-- Dependencies: 287
-- Name: stock_write_offs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_write_offs_id_seq', 8, true);


--
-- TOC entry 5492 (class 0 OID 0)
-- Dependencies: 265
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 14, true);


--
-- TOC entry 5493 (class 0 OID 0)
-- Dependencies: 239
-- Name: survey_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_options_id_seq', 34, true);


--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 241
-- Name: survey_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_questions_id_seq', 14, true);


--
-- TOC entry 5495 (class 0 OID 0)
-- Dependencies: 243
-- Name: survey_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_responses_id_seq', 23, true);


--
-- TOC entry 5496 (class 0 OID 0)
-- Dependencies: 251
-- Name: survey_template_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_template_options_id_seq', 1, false);


--
-- TOC entry 5497 (class 0 OID 0)
-- Dependencies: 249
-- Name: survey_template_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_template_questions_id_seq', 1, false);


--
-- TOC entry 5498 (class 0 OID 0)
-- Dependencies: 247
-- Name: survey_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_templates_id_seq', 1, false);


--
-- TOC entry 5499 (class 0 OID 0)
-- Dependencies: 245
-- Name: surveys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.surveys_id_seq', 7, true);


--
-- TOC entry 5500 (class 0 OID 0)
-- Dependencies: 267
-- Name: ticket_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_messages_id_seq', 20, true);


--
-- TOC entry 5501 (class 0 OID 0)
-- Dependencies: 221
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 2, true);


--
-- TOC entry 5502 (class 0 OID 0)
-- Dependencies: 291
-- Name: treasury_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.treasury_transactions_id_seq', 42, true);


--
-- TOC entry 5503 (class 0 OID 0)
-- Dependencies: 237
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_achievements_id_seq', 20, true);


--
-- TOC entry 5504 (class 0 OID 0)
-- Dependencies: 271
-- Name: user_quests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_quests_id_seq', 25, true);


--
-- TOC entry 5505 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 24, true);


-- Completed on 2026-11-12 17:25:02

--
-- PostgreSQL database dump complete
--

\unrestrict JI0foHB66KhdsW7DdPHzs3ldAqKCWxLi4rdmZhKpXeksFSP3dgAjoA4F4ZccMhC

