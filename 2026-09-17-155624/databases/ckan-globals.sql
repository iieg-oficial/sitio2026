--
-- PostgreSQL database cluster dump
--

\restrict bAbKDeUzXad2g76Mbqec9R3NEan2pepWiCAaqP8j06HSfbIYJibIBwmOfJ2so7s

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE ckan;
ALTER ROLE ckan WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:9iZ1PxpEIxa3odUDwH1GfA==$ZkvIVjSEucGs8vYCE2BgUSXveKzYIISUcFn5llvpwkQ=:DuWbqQR/VMqjOfbun4zzxOJtk9jDSu8fVkAeixYnveg=';
CREATE ROLE datastore_default;
ALTER ROLE datastore_default WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:i5qxh7mqRHKOacBK8kglvg==$z9p8hXu+h/uNezxD2+TuNV0oiW5dJ83sgQ5bwFX+osQ=:MY2RmuJbMTUBc/lGGAqY+kVU+nGFRvEnacY4Vk+lSRI=';
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:8b5scewx4TH/ArHAlXZ+jw==$tWpG7Ns9CIx5ZhricxircSHnqgyXHdUfSM15fkC3ej4=:oGOMNdhbrsWwf4EViIXKMROC9cS/Wi+JvXvkphIcm/w=';

--
-- User Configurations
--








\unrestrict bAbKDeUzXad2g76Mbqec9R3NEan2pepWiCAaqP8j06HSfbIYJibIBwmOfJ2so7s

--
-- PostgreSQL database cluster dump complete
--

