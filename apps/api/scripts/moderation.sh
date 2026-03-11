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
  reported-lists
  hidden-lists
  hide-list <listId>
  restore-list <listId>
  clear-list-reports <listId>
  reported-list-comments
  hidden-list-comments
  hide-list-comment <commentId>
  restore-list-comment <commentId>
  clear-list-comment-reports <commentId>

Examples:
  pnpm --filter api run moderation -- pending-vendors
  pnpm --filter api run moderation -- approve-vendor <vendorId>
  ADMIN_API_KEY=dev-admin-key pnpm --filter api run moderation -- pending-reviews
  pnpm --filter api run moderation -- reported-lists
  pnpm --filter api run moderation -- reported-list-comments
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
  reported-lists)
    curl_json GET "/admin/moderation/lists/reported"
    ;;
  hidden-lists)
    curl_json GET "/admin/moderation/lists/hidden"
    ;;
  hide-list)
    list_id="${2:-}"
    [ -n "$list_id" ] || { echo "Missing listId"; usage; exit 1; }
    curl_json POST "/admin/moderation/lists/$list_id/hide"
    ;;
  restore-list)
    list_id="${2:-}"
    [ -n "$list_id" ] || { echo "Missing listId"; usage; exit 1; }
    curl_json POST "/admin/moderation/lists/$list_id/restore"
    ;;
  clear-list-reports)
    list_id="${2:-}"
    [ -n "$list_id" ] || { echo "Missing listId"; usage; exit 1; }
    curl_json POST "/admin/moderation/lists/$list_id/clear-reports"
    ;;
  reported-list-comments)
    curl_json GET "/admin/moderation/list-comments/reported"
    ;;
  hidden-list-comments)
    curl_json GET "/admin/moderation/list-comments/hidden"
    ;;
  hide-list-comment)
    comment_id="${2:-}"
    [ -n "$comment_id" ] || { echo "Missing commentId"; usage; exit 1; }
    curl_json POST "/admin/moderation/list-comments/$comment_id/hide"
    ;;
  restore-list-comment)
    comment_id="${2:-}"
    [ -n "$comment_id" ] || { echo "Missing commentId"; usage; exit 1; }
    curl_json POST "/admin/moderation/list-comments/$comment_id/restore"
    ;;
  clear-list-comment-reports)
    comment_id="${2:-}"
    [ -n "$comment_id" ] || { echo "Missing commentId"; usage; exit 1; }
    curl_json POST "/admin/moderation/list-comments/$comment_id/clear-reports"
    ;;
  *)
    usage
    ;;
esac
