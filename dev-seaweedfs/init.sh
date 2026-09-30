#!/bin/sh
set -e

: "${ACERVO_ADMIN_ACCESS_KEY:?ACERVO_ADMIN_ACCESS_KEY is required}"
: "${ACERVO_ADMIN_SECRET_KEY:?ACERVO_ADMIN_SECRET_KEY is required}"
: "${ACERVO_ACCESS_KEY:?ACERVO_ACCESS_KEY is required}"
: "${ACERVO_SECRET_KEY:?ACERVO_SECRET_KEY is required}"
: "${ACERVO_IIEG_ACCESS_KEY:?ACERVO_IIEG_ACCESS_KEY is required}"
: "${ACERVO_IIEG_SECRET_KEY:?ACERVO_IIEG_SECRET_KEY is required}"

TEMPLATE=/init-template/identities.json.template
TARGET=/tmp/identities.json
BUCKETS="${ACERVO_BUCKETS:-portal}"

if [ ! -s "$TEMPLATE" ]; then
    echo "[seaweedfs-dev] ERROR: $TEMPLATE missing or empty" >&2
    exit 1
fi

sed \
    -e "s|\${ACERVO_ADMIN_ACCESS_KEY}|${ACERVO_ADMIN_ACCESS_KEY}|g" \
    -e "s|\${ACERVO_ADMIN_SECRET_KEY}|${ACERVO_ADMIN_SECRET_KEY}|g" \
    -e "s|\${ACERVO_ACCESS_KEY}|${ACERVO_ACCESS_KEY}|g" \
    -e "s|\${ACERVO_SECRET_KEY}|${ACERVO_SECRET_KEY}|g" \
    -e "s|\${ACERVO_IIEG_ACCESS_KEY}|${ACERVO_IIEG_ACCESS_KEY}|g" \
    -e "s|\${ACERVO_IIEG_SECRET_KEY}|${ACERVO_IIEG_SECRET_KEY}|g" \
    "$TEMPLATE" > "$TARGET"

echo "[seaweedfs-dev] identities written to $TARGET"

(
    sleep 8
    for bucket in $BUCKETS; do
        echo "s3.bucket.create -name $bucket" | weed shell -master localhost:9333 2>/dev/null || true
        echo "[seaweedfs-dev] bucket $bucket ready"
    done
) &

exec weed server "$@"
