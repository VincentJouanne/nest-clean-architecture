docker run \
    -d \
    --rm \
    --name test-db \
    -p 5432:5432 \
    -e POSTGRES_USER=test_user \
    -e POSTGRES_PASSWORD=test_password \
    -e POSTGRES_DB=test_db \
    postgres:11.3-alpine \
    -c shared_buffers=500MB \
    -c fsync=off
