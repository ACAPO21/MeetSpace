-- CreateTable
CREATE TABLE "_BookingParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookingParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookingParticipants_B_index" ON "_BookingParticipants"("B");

-- AddForeignKey
ALTER TABLE "_BookingParticipants" ADD CONSTRAINT "_BookingParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingParticipants" ADD CONSTRAINT "_BookingParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
