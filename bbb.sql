--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

-- Started on 2025-05-13 19:24:49

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- TOC entry 220 (class 1259 OID 34766)
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    job_id integer,
    student_id integer,
    name text NOT NULL,
    email text NOT NULL,
    resume text NOT NULL,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 34765)
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO postgres;

--
-- TOC entry 4879 (class 0 OID 0)
-- Dependencies: 219
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- TOC entry 218 (class 1259 OID 34751)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    posted_by integer,
    line_id text NOT NULL,
    salary_range text,
    details text
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 34750)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- TOC entry 4880 (class 0 OID 0)
-- Dependencies: 217
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 221 (class 1259 OID 34788)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 34739)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    role character varying(50) NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'employer'::character varying, 'admin'::character varying, 'guest'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 34738)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4881 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4705 (class 2604 OID 34769)
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- TOC entry 4703 (class 2604 OID 34754)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4702 (class 2604 OID 34742)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4872 (class 0 OID 34766)
-- Dependencies: 220
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, job_id, student_id, name, email, resume, applied_at) FROM stdin;
\.


--
-- TOC entry 4870 (class 0 OID 34751)
-- Dependencies: 218
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, company, type, created_at, posted_by, line_id, salary_range, details) FROM stdin;
\.


--
-- TOC entry 4873 (class 0 OID 34788)
-- Dependencies: 221
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- TOC entry 4868 (class 0 OID 34739)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, role) FROM stdin;
1	waiyan.k65@rsu.ac.th	$2b$10$jQ0O19ddHfzRrtkUuNJ4J.eZuBf0e9DigojIjvJYdhG9FwaR8UbBS	admin
2	aungmyo.h65@rsu.ac.th	$2b$10$PJGSBkKcywKCzc3Do.7I.e8T.YdelOnm2C0m.E4Mz7kRXii.7n6Aa	student
3	wykyaw2001@gmail.com	$2b$10$oZB2R57aWNnqB2xKAAjW..WnDsn0DEc1aALiw2PvMPUERtTa3ceY6	student
9	waiyan12.kmd@gmail.com	\N	guest
10	Owner@rsu.ac.th	$2b$10$qs5fTRm/fRvQrykI9grJHOC0DOMMWA4WINrBaE9FoML2GB13TJhfe	student
11	kaungmyat.h66@rsu.ac.th	\N	student
12	ok@example.com	$2b$10$UlKfiuJgXS9fEeOhy//A3e4KgssHhRg5Ul0LP28ggCnamp7189BK6	guest
16	nang.h65@rsu.ac.th	\N	student
\.


--
-- TOC entry 4882 (class 0 OID 0)
-- Dependencies: 219
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 2, true);


--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 217
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 2, true);


--
-- TOC entry 4884 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 16, true);


--
-- TOC entry 4715 (class 2606 OID 34776)
-- Name: applications applications_job_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_student_id_key UNIQUE (job_id, student_id);


--
-- TOC entry 4717 (class 2606 OID 34774)
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4713 (class 2606 OID 34759)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 34794)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 4709 (class 2606 OID 34749)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4711 (class 2606 OID 34747)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4718 (class 1259 OID 34795)
-- Name: session_expire_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX session_expire_idx ON public.session USING btree (expire);


--
-- TOC entry 4722 (class 2606 OID 34777)
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 4723 (class 2606 OID 34782)
-- Name: applications applications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4721 (class 2606 OID 34760)
-- Name: jobs jobs_posted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-05-13 19:24:49

--
-- PostgreSQL database dump complete
--

