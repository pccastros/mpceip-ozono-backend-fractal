-- Table: public.user

-- DROP TABLE IF EXISTS public."user";

CREATE TABLE IF NOT EXISTS public."user"
(
    id  SERIAL PRIMARY KEY,
    name character varying COLLATE pg_catalog."default",
    email character varying COLLATE pg_catalog."default",
    phone character varying COLLATE pg_catalog."default",
    company character varying COLLATE pg_catalog."default",
    password character varying COLLATE pg_catalog."default",
    address character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone,
    updated_at timestamp without time zone
)

CREATE TABLE IF NOT EXISTS public."pais"
(
    id SERIAL PRIMARY KEY,
    name character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);

CREATE TABLE IF NOT EXISTS public."proveedor"
(
    id SERIAL PRIMARY KEY,
    name character varying COLLATE pg_catalog."default",
    country character varying COLLATE pg_catalog."default",
    activo boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
)

CREATE TABLE IF NOT EXISTS public."sustancia"
(
    id SERIAL PRIMARY KEY,
    name character varying COLLATE pg_catalog."default",
    subpartida character varying COLLATE pg_catalog."default",
    pao character varying COLLATE pg_catalog."default",
    pcg character varying COLLATE pg_catalog."default",
    grupo_sust character varying COLLATE pg_catalog."default",
    activo boolean,
    cupo_prod boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
)

CREATE TABLE IF NOT EXISTS public."importador"
(
    id SERIAL PRIMARY KEY,
    name character varying COLLATE pg_catalog."default",
    ruc character varying COLLATE pg_catalog."default",
    phone character varying COLLATE pg_catalog."default",
    user_import character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone,
    updated_at timestamp without time zone
)

CREATE TABLE IF NOT EXISTS public."anio"
(
    id SERIAL PRIMARY KEY,
    name character varying COLLATE pg_catalog."default",
    activo boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
)

CREATE TABLE IF NOT EXISTS public."grupo_sust"
(
    id SERIAL PRIMARY KEY,
    name character varying COLLATE pg_catalog."default",
    activo boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
)

CREATE TABLE IF NOT EXISTS public."cupo"
(
    id SERIAL PRIMARY KEY,
    importador character varying COLLATE pg_catalog."default",
    importador_id int,
    anio character varying COLLATE pg_catalog."default",
    hfc character varying COLLATE pg_catalog."default",
    hcfc character varying COLLATE pg_catalog."default",
    created_at timestamp without time zone,
    updated_at timestamp without time zone
)

-- Table: public.onu_imports

-- DROP TABLE IF EXISTS public.onu_imports;

-- Table: public.importacion
DROP TABLE IF EXISTS public.importacion;

CREATE TABLE IF NOT EXISTS public.importacion
(
    id serial,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    authorization_date date,
    solicitud_date date,
    month character varying(255) COLLATE pg_catalog."default",
    cupo_asignado numeric(19,2),
    status character varying(255) COLLATE pg_catalog."default",
    cupo_restante numeric(19,2),
    total_solicitud numeric(19,2),
    total_pesokg numeric(19,2),
    vue character varying(255) COLLATE pg_catalog."default",
    factura_file_it integer,
    dai_file_id integer,
    data_file_id integer,
    importador character varying(255) COLLATE pg_catalog."default",
    importador_id integer,
    orden_file integer,
    user_id integer,
    years bigint,
    country character varying(255) COLLATE pg_catalog."default",
    proveedor character varying(255) COLLATE pg_catalog."default",
    send_email boolean,
    grupo character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT importacion_vue_key UNIQUE (vue)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.importacion
    OWNER to onuapp;



-- Table: public.onu_detail_imports

-- DROP TABLE IF EXISTS public.onu_detail_imports;



drop table importacion_detail
CREATE TABLE IF NOT EXISTS public.importacion_detail
(
    id serial NOT NULL,
    created_at timestamp ,
    updated_at timestamp ,
    cif numeric(20,2),
    co2 numeric(20,2),
    fob numeric(20,2),
    peso_kg numeric(20,2),
    peso_pao numeric(20,2),
    country bigint,
    importacion bigint,
    sustancia character varying(255),
	subpartida character varying(255),
    price numeric(20,2),
    ficha_id int
);


drop table files;
CREATE TABLE IF NOT EXISTS public.files
(
    id serial NOT NULL,
	name varchar(255),
    file bytea,
	created_at timestamp ,
    updated_at timestamp 
);