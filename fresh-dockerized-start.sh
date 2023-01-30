# Start both the postgres and prisma services
docker-compose up -d

# Reset schema
echo "Resetting schema..."
docker exec -i nextjs yarn prisma migrate reset --force --skip-seed
echo "Schema reset complete."

# Push schema to database
echo "Pushing schema to database..."
docker exec -i nextjs yarn prisma db push
echo "Schema pushed to database."

# Now, seed the database using the seed script
echo "Seeding database..."
docker exec -i postgres psql -U postgres -d postgres < ./prisma/sql/chinook-postgre.sql