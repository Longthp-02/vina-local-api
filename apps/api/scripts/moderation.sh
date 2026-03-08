#!/usr/bin/env sh
set -eu

API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
ADMIN_API_KEY="${ADMIN_API_KEY:-}"

curl_json() {
  method="$1"
  path="$2"

  if [ -n "$ADMIN_API_KEY" ]; then
    curl -sS -X "$method" "$API_BASE_URL$path" \
      -H "x-admin-key: $ADMIN_API_KEY" \
      -H "content-type: application/json"
  else
    curl -sS -X "$method" "$API_BASE_URL$path" \
      -H "content-type: application/json"
  fi
}

usage() {
  cat <<USAGE
Moderation helper commands:
  pending-vendors
  approve-vendor <vendorId>
  reject-vendor <vendorId>
  pending-reviews
  flagged-reviews

Examples:
  pnpm --filter api run moderation -- pending-vendors
  pnpm --filter api run moderation -- approve-vendor <vendorId>
  ADMIN_API_KEY=dev-admin-key pnpm --filter api run moderation -- pending-reviews
USAGE
}

cmd="${1:-}"

case "$cmd" in
  pending-vendors)
    curl_json GET "/admin/moderation/vendors/pending"
    ;;
  approve-vendor)
    vendor_id="${2:-}"
    [ -n "$vendor_id" ] || { echo "Missing vendorId"; usage; exit 1; }
    curl_json POST "/admin/moderation/vendors/$vendor_id/approve"
    ;;
  reject-vendor)
    vendor_id="${2:-}"
    [ -n "$vendor_id" ] || { echo "Missing vendorId"; usage; exit 1; }
    curl_json POST "/admin/moderation/vendors/$vendor_id/reject"
    ;;
  pending-reviews)
    curl_json GET "/admin/moderation/reviews/pending"
    ;;
  flagged-reviews)
    curl_json GET "/admin/moderation/reviews/flagged"
    ;;
  *)
    usage
    ;;
esac
