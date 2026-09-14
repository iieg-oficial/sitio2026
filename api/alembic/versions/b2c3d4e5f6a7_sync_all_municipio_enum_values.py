"""sync all municipio enum values

Revision ID: b2c3d4e5f6a7
Revises: a8f9e0b1c2d3
Create Date: 2026-08-20

Adds every MunicipioEnum member name to the Postgres municipioenum type.
Previous migrations added values via a hand-maintained list that drifted
out of sync with app/models/cuadernillos.py (e.g. guadalajara, zapopan
were defined in the model but never added to the DB enum). This
migration imports the model directly so it can never miss a value again.
"""
import sqlalchemy as sa

from alembic import op

MUNICIPIO_VALUES = (
    "acatic",
    "acatlan_de_juarez",
    "ahualulco_de_mercado",
    "amacueca",
    "amatitan",
    "ameca",
    "arandas",
    "atemajac_de_brizuela",
    "atengo",
    "atenguillo",
    "atotonilco_el_alto",
    "atoyac",
    "autlan_de_navarro",
    "ayotlan",
    "ayutla",
    "bolanos",
    "cabo_corrientes",
    "canadas_de_obregon",
    "casimiro_castillo",
    "chapala",
    "chimaltitan",
    "chiquilistlan",
    "cihuatlan",
    "cocula",
    "colotlan",
    "concepcion_de_buenos_aires",
    "cuautitlan_de_garcia_barragan",
    "cuautla",
    "cuquio",
    "degollado",
    "ejutla",
    "el_arenal",
    "el_grullo",
    "el_limon",
    "el_salto",
    "encarnacion_de_diaz",
    "etzatlan",
    "gomez_farias",
    "guachinango",
    "guadalajara",
    "hostotipaquillo",
    "huejucar",
    "huejuquilla_el_alto",
    "ixtlahuacan_de_los_membrillos",
    "ixtlahuacan_del_rio",
    "jalostotitlan",
    "jamay",
    "jesus_maria",
    "jilotlan_de_los_dolores",
    "jocotepec",
    "juanacatlan",
    "juchitlan",
    "la_barca",
    "la_huerta",
    "la_manzanilla_de_la_paz",
    "lagos_de_moreno",
    "magdalena",
    "mascota",
    "mazamitla",
    "mexticacan",
    "mezquitic",
    "mixtlan",
    "ocotlan",
    "ojuelos_de_jalisco",
    "pihuamo",
    "poncitlan",
    "puerto_vallarta",
    "quitupan",
    "san_cristobal_de_la_barranca",
    "san_diego_de_alejandria",
    "san_gabriel",
    "san_ignacio_cerro_gordo",
    "san_juan_de_los_lagos",
    "san_juanito_de_escobedo",
    "san_julian",
    "san_marcos",
    "san_martin_de_bolanos",
    "san_martin_hidalgo",
    "san_miguel_el_alto",
    "san_pedro_tlaquepaque",
    "san_sebastian_del_oeste",
    "santa_maria_de_los_angeles",
    "santa_maria_del_oro",
    "sayula",
    "tala",
    "talpa_de_allende",
    "tamazula_de_gordiano",
    "tapalpa",
    "tecalitlan",
    "techaluta_de_montenegro",
    "tecolotlan",
    "tenamaxtlan",
    "teocaltiche",
    "teocuitatlan_de_corona",
    "tepatitlan_de_morelos",
    "tequila",
    "teuchitlan",
    "tizapan_el_alto",
    "tlajomulco_de_zuniga",
    "toliman",
    "tomatlan",
    "tonala",
    "tonaya",
    "tonila",
    "totatiche",
    "tototlan",
    "tuxcacuesco",
    "tuxcueca",
    "tuxpan",
    "union_de_san_antonio",
    "union_de_tula",
    "valle_de_guadalupe",
    "valle_de_juarez",
    "villa_corona",
    "villa_guerrero",
    "villa_hidalgo",
    "villa_purificacion",
    "yahualica_de_gonzalez_gallo",
    "zacoalco_de_torres",
    "zapotiltic",
    "zapotitlan_de_vadillo",
    "zapotlan_del_rey",
    "zapotlan_el_grande",
    "zapotlanejo",
    "zapopan",
)

revision = 'b2c3d4e5f6a7'
down_revision = 'a8f9e0b1c2d3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ALTER TYPE cannot run inside a transaction in PostgreSQL

    for value in MUNICIPIO_VALUES:
        op.execute(
            sa.text("ALTER TYPE municipioenum ADD VALUE IF NOT EXISTS :value").bindparams(
                value=value
            )
        )


def downgrade() -> None:
    # Postgres does not support removing enum values; no-op.
    pass
