--
-- PostgreSQL database cluster dump
--

\restrict NZ9tFft54IpPDkqFnQASKyNwMggOHDrSbRWW1jOsacOhZ94XtOZwMe7iZyD7JD4

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE iieg_user;
ALTER ROLE iieg_user WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:VzDi1MTPsRH5eVt1aw9Xtg==$zlkHbcG+qvPqlQZsqxFKGByxG9WmHZdSkkyUt2s3Rn4=:ZFD+jBu5FCyuHGGQnps9HRpd/5KnKyLyEK3KsG8QGyM=';

--
-- User Configurations
--








\unrestrict NZ9tFft54IpPDkqFnQASKyNwMggOHDrSbRWW1jOsacOhZ94XtOZwMe7iZyD7JD4

--
-- PostgreSQL database cluster dump complete
--

