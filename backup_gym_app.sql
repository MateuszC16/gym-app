--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises (
    id integer NOT NULL,
    name text NOT NULL,
    muscle_group text,
    current_weight double precision,
    max_weight double precision,
    max_weight_date date,
    image_one text,
    image_two text,
    description text,
    user_id integer NOT NULL
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- Name: exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_id_seq OWNER TO postgres;

--
-- Name: exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_id_seq OWNED BY public.exercises.id;


--
-- Name: training_day_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.training_day_exercises (
    training_day_id integer NOT NULL,
    exercise_id integer NOT NULL,
    description text,
    weight double precision
);


ALTER TABLE public.training_day_exercises OWNER TO postgres;

--
-- Name: training_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.training_days (
    id integer NOT NULL,
    date date NOT NULL,
    location text NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.training_days OWNER TO postgres;

--
-- Name: training_days_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.training_days_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.training_days_id_seq OWNER TO postgres;

--
-- Name: training_days_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.training_days_id_seq OWNED BY public.training_days.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    user_type character varying(20) NOT NULL,
    gmail character varying(255) NOT NULL,
    login character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    CONSTRAINT users_user_type_check CHECK (((user_type)::text = ANY ((ARRAY['normal'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: exercises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN id SET DEFAULT nextval('public.exercises_id_seq'::regclass);


--
-- Name: training_days id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_days ALTER COLUMN id SET DEFAULT nextval('public.training_days_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (id, name, muscle_group, current_weight, max_weight, max_weight_date, image_one, image_two, description, user_id) FROM stdin;
8	Wyciskanie sztangi prostej na ławce skośnej	klatka piersiowa	77	\N	\N	\N	\N	\N	2
10	Podciąganie podchwytem	plecy	0	\N	\N	\N	\N	\N	1
2	Wyciskanie hantli ławka płaska	klatka piersiowa	0	\N	\N	\N	\N	\N	1
3	Wyciskanie hantli ławka skośna 15 stopni	klatka piersiowa	0	\N	\N	\N	\N	\N	1
6	Podciąganie podchwytem 	plecy	0	\N	\N	\N	\N	\N	1
7	Ściąganie drążka z wyciągu górnego	plecy	0	\N	2025-03-23	\N	\N	\N	1
4	Uginanie sztangi łamanej 	biceps	0	\N	\N	\N	\N	\N	1
11	Uginanie hantli z supinacją	biceps	0	\N	\N	\N	\N	\N	1
12	Uginanie hantli chwytem młotkowym	biceps	0	\N	\N	\N	\N	\N	1
14	Prostowanie ramion na wyciągu górnym z warkoczem	triceps	0	\N	\N	\N	\N	\N	1
16	Wznosy bokiem	barki	0	\N	\N	\N	\N	\N	1
17	Wiosłowanie sztangą nachwytem	plecy	0	\N	\N	\N	\N	\N	1
18	Wyciskanie żołnierskie stojąc	barki	0	\N	\N	\N	\N	\N	1
20	Uginanie hantli siedząc na ławce 45 stopni	biceps	0	\N	\N	\N	\N	\N	1
21	Bayesian Curls	biceps	0	\N	\N	\N	\N	\N	1
22	Wyciskanie sztangi prostej na ławce dodatniej	klatka piersiowa	0	\N	\N	\N	\N	\N	1
23	Wyciskanie hantli nad głowę siedząc	barki	0	\N	\N	\N	\N	\N	1
24	Focze wiosłowanie w oparciu o ławke	plecy	0	\N	\N	\N	\N	\N	1
25	Unoszenie ramienia z wykorzystaniem linki wyciągu dolnego	barki	0	\N	\N	\N	\N	\N	1
26	Martwy ciąg	plecy	0	\N	\N	\N	\N	\N	1
27	Wyciskanie francuskie sztangą łamana	triceps	0	\N	\N	\N	\N	\N	1
28	Wyciskanie francuskie hantlami na ławce poziomej 	triceps	0	\N	\N	\N	\N	\N	1
29	Spider Curls sztangą prostą	biceps	0	\N	\N	\N	\N	\N	1
30	Rozpiętki hantlami na ławce poziomej	klatka piersiowa	0	\N	\N	\N	\N	\N	1
31	Przysiad ze sztangą	nogi	0	\N	\N	\N	\N	\N	1
32	Hip Trust	pośladki	0	\N	\N	\N	\N	\N	1
34	Maszyna do dipów	triceps	0	\N	\N	\N	\N	\N	1
1	Wyciskanie sztangi ławka płaska 	klatka piersiowa	\N	\N	\N	\N	\N	\N	1
15	Rozpiętki na maszynie 	klatka piersiowa	\N	\N	\N	\N	\N	\N	1
5	Dipy 	triceps	\N	\N	\N	\N	\N	\N	1
33	Wyprost ręki z tyłu jednorącz 	triceps	\N	\N	\N	\N	\N	\N	1
19	Wyciskanie żołnierskie siedząc	barki	\N	\N	\N	\N	\N	\N	1
\.


--
-- Data for Name: training_day_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.training_day_exercises (training_day_id, exercise_id, description, weight) FROM stdin;
2	4	null	37.5
2	1	null	82
3	1	\N	\N
3	15	\N	\N
3	5	\N	\N
3	33	\N	\N
3	19	\N	\N
\.


--
-- Data for Name: training_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.training_days (id, date, location, user_id) FROM stdin;
2	2025-03-21	DOM	1
3	2025-03-23	Rewolucji	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, first_name, last_name, user_type, gmail, login, password_hash) FROM stdin;
1	mateusz	mateusz	normal	mateusz@gmail.com	mateusz	$2b$10$oyS7fPjivJ3mdrE31mN8su8BXHYlsregUnr3LlMGB7Ti8frfuGYDS
2	kuba	kuba	normal	kuba@gmail.com	kuba	$2b$10$FN6e4LQpOn0EfQ9GESxuZeA1JMjJIMuI/chAnUq7sfFKPzE0fz15u
\.


--
-- Name: exercises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_id_seq', 34, true);


--
-- Name: training_days_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.training_days_id_seq', 3, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 2, true);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- Name: training_day_exercises training_day_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_day_exercises
    ADD CONSTRAINT training_day_exercises_pkey PRIMARY KEY (training_day_id, exercise_id);


--
-- Name: training_days training_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_days
    ADD CONSTRAINT training_days_pkey PRIMARY KEY (id);


--
-- Name: users users_gmail_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_gmail_key UNIQUE (gmail);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: exercises fk_exercises_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT fk_exercises_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: training_days fk_training_days_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_days
    ADD CONSTRAINT fk_training_days_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: training_day_exercises training_day_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_day_exercises
    ADD CONSTRAINT training_day_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- Name: training_day_exercises training_day_exercises_training_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.training_day_exercises
    ADD CONSTRAINT training_day_exercises_training_day_id_fkey FOREIGN KEY (training_day_id) REFERENCES public.training_days(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

