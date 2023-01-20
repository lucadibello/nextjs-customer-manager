-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "Album" (
    "AlbumId" INTEGER NOT NULL,
    "Title" VARCHAR(160) NOT NULL,
    "ArtistId" INTEGER NOT NULL,

    CONSTRAINT "PK_Album" PRIMARY KEY ("AlbumId")
);

-- CreateTable
CREATE TABLE "Artist" (
    "ArtistId" INTEGER NOT NULL,
    "Name" VARCHAR(120),

    CONSTRAINT "PK_Artist" PRIMARY KEY ("ArtistId")
);

-- CreateTable
CREATE TABLE "Customer" (
    "CustomerId" INTEGER NOT NULL,
    "FirstName" VARCHAR(40) NOT NULL,
    "LastName" VARCHAR(20) NOT NULL,
    "Company" VARCHAR(80),
    "Address" VARCHAR(70),
    "City" VARCHAR(40),
    "State" VARCHAR(40),
    "Country" VARCHAR(40),
    "PostalCode" VARCHAR(10),
    "Phone" VARCHAR(24),
    "Fax" VARCHAR(24),
    "Email" VARCHAR(60) NOT NULL,
    "SupportRepId" INTEGER,
    "Password" TEXT NOT NULL,
    "Role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "RefreshToken" TEXT,
    "TwoFactorToken" TEXT,

    CONSTRAINT "PK_Customer" PRIMARY KEY ("CustomerId")
);

-- CreateTable
CREATE TABLE "Employee" (
    "EmployeeId" INTEGER NOT NULL,
    "LastName" VARCHAR(20) NOT NULL,
    "FirstName" VARCHAR(20) NOT NULL,
    "Title" VARCHAR(30),
    "ReportsTo" INTEGER,
    "BirthDate" TIMESTAMP(6),
    "HireDate" TIMESTAMP(6),
    "Address" VARCHAR(70),
    "City" VARCHAR(40),
    "State" VARCHAR(40),
    "Country" VARCHAR(40),
    "PostalCode" VARCHAR(10),
    "Phone" VARCHAR(24),
    "Fax" VARCHAR(24),
    "Email" VARCHAR(60),

    CONSTRAINT "PK_Employee" PRIMARY KEY ("EmployeeId")
);

-- CreateTable
CREATE TABLE "Genre" (
    "GenreId" INTEGER NOT NULL,
    "Name" VARCHAR(120),

    CONSTRAINT "PK_Genre" PRIMARY KEY ("GenreId")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "InvoiceId" INTEGER NOT NULL,
    "CustomerId" INTEGER NOT NULL,
    "InvoiceDate" TIMESTAMP(6) NOT NULL,
    "BillingAddress" VARCHAR(70),
    "BillingCity" VARCHAR(40),
    "BillingState" VARCHAR(40),
    "BillingCountry" VARCHAR(40),
    "BillingPostalCode" VARCHAR(10),
    "Total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PK_Invoice" PRIMARY KEY ("InvoiceId")
);

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "InvoiceLineId" INTEGER NOT NULL,
    "InvoiceId" INTEGER NOT NULL,
    "TrackId" INTEGER NOT NULL,
    "UnitPrice" DECIMAL(10,2) NOT NULL,
    "Quantity" INTEGER NOT NULL,

    CONSTRAINT "PK_InvoiceLine" PRIMARY KEY ("InvoiceLineId")
);

-- CreateTable
CREATE TABLE "MediaType" (
    "MediaTypeId" INTEGER NOT NULL,
    "Name" VARCHAR(120),

    CONSTRAINT "PK_MediaType" PRIMARY KEY ("MediaTypeId")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "PlaylistId" INTEGER NOT NULL,
    "Name" VARCHAR(120),

    CONSTRAINT "PK_Playlist" PRIMARY KEY ("PlaylistId")
);

-- CreateTable
CREATE TABLE "PlaylistTrack" (
    "PlaylistId" INTEGER NOT NULL,
    "TrackId" INTEGER NOT NULL,

    CONSTRAINT "PK_PlaylistTrack" PRIMARY KEY ("PlaylistId","TrackId")
);

-- CreateTable
CREATE TABLE "Track" (
    "TrackId" INTEGER NOT NULL,
    "Name" VARCHAR(200) NOT NULL,
    "AlbumId" INTEGER,
    "MediaTypeId" INTEGER NOT NULL,
    "GenreId" INTEGER,
    "Composer" VARCHAR(220),
    "Milliseconds" INTEGER NOT NULL,
    "Bytes" INTEGER,
    "UnitPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PK_Track" PRIMARY KEY ("TrackId")
);

-- CreateIndex
CREATE INDEX "IFK_AlbumArtistId" ON "Album"("ArtistId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_Email_key" ON "Customer"("Email");

-- CreateIndex
CREATE INDEX "IFK_CustomerSupportRepId" ON "Customer"("SupportRepId");

-- CreateIndex
CREATE INDEX "IFK_EmployeeReportsTo" ON "Employee"("ReportsTo");

-- CreateIndex
CREATE INDEX "IFK_InvoiceCustomerId" ON "Invoice"("CustomerId");

-- CreateIndex
CREATE INDEX "IFK_InvoiceLineInvoiceId" ON "InvoiceLine"("InvoiceId");

-- CreateIndex
CREATE INDEX "IFK_InvoiceLineTrackId" ON "InvoiceLine"("TrackId");

-- CreateIndex
CREATE INDEX "IFK_PlaylistTrackTrackId" ON "PlaylistTrack"("TrackId");

-- CreateIndex
CREATE INDEX "IFK_TrackAlbumId" ON "Track"("AlbumId");

-- CreateIndex
CREATE INDEX "IFK_TrackGenreId" ON "Track"("GenreId");

-- CreateIndex
CREATE INDEX "IFK_TrackMediaTypeId" ON "Track"("MediaTypeId");

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "FK_AlbumArtistId" FOREIGN KEY ("ArtistId") REFERENCES "Artist"("ArtistId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "FK_CustomerSupportRepId" FOREIGN KEY ("SupportRepId") REFERENCES "Employee"("EmployeeId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "FK_EmployeeReportsTo" FOREIGN KEY ("ReportsTo") REFERENCES "Employee"("EmployeeId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "FK_InvoiceCustomerId" FOREIGN KEY ("CustomerId") REFERENCES "Customer"("CustomerId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "FK_InvoiceLineInvoiceId" FOREIGN KEY ("InvoiceId") REFERENCES "Invoice"("InvoiceId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "FK_InvoiceLineTrackId" FOREIGN KEY ("TrackId") REFERENCES "Track"("TrackId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "FK_PlaylistTrackPlaylistId" FOREIGN KEY ("PlaylistId") REFERENCES "Playlist"("PlaylistId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "FK_PlaylistTrackTrackId" FOREIGN KEY ("TrackId") REFERENCES "Track"("TrackId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "FK_TrackAlbumId" FOREIGN KEY ("AlbumId") REFERENCES "Album"("AlbumId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "FK_TrackGenreId" FOREIGN KEY ("GenreId") REFERENCES "Genre"("GenreId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "FK_TrackMediaTypeId" FOREIGN KEY ("MediaTypeId") REFERENCES "MediaType"("MediaTypeId") ON DELETE NO ACTION ON UPDATE NO ACTION;
