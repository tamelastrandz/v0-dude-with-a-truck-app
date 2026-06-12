-- Messaging + driver write access for bookings
-- Run in Supabase SQL Editor after schema.sql

-- ---- CONVERSATIONS ----
CREATE TABLE IF NOT EXISTS public.conversations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body             TEXT NOT NULL,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON public.conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking parties can view conversations"
  ON public.conversations FOR SELECT USING (
    auth.uid() = customer_id OR auth.uid() = driver_id
  );

CREATE POLICY "Booking parties can create conversations"
  ON public.conversations FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR auth.uid() = driver_id
  );

CREATE POLICY "Conversation participants can view messages"
  ON public.messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = auth.uid() OR c.driver_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = auth.uid() OR c.driver_id = auth.uid())
    )
  );

-- ---- DRIVER BOOKING ACCESS ----
CREATE POLICY "Drivers can insert their own bookings"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own bookings"
  ON public.bookings FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can mark requests booked"
  ON public.move_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'driver')
  );
