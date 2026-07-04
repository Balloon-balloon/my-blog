#!/bin/sh
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true
npx next start -H 0.0.0.0
