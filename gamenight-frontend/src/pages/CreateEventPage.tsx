import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEventsStore } from '../store/eventsStore';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorAlert from '../components/ErrorAlert';

const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  maxParticipants: z.coerce.number().min(1, 'Must have at least 1 participant'),
  image: z.any().optional(),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent, isLoading, error, setError } = useEventsStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
  });

  const imageErrorMessage = errors.image && typeof errors.image.message === 'string'
    ? errors.image.message
    : undefined;

  const onSubmit = async (data: CreateEventFormData) => {
    setLocalError(null);

    const parsedDate = new Date(data.date);
    if (Number.isNaN(parsedDate.getTime())) {
      setLocalError('Format de date invalide');
      return;
    }

    const payload = {
      title: data.title,
      description: data.description,
      date: parsedDate.toISOString(),
      location: data.location,
      maxParticipants: data.maxParticipants,
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });
    const files = data.image as FileList | undefined;
    if (files?.length) {
      formData.append('image', files[0]);
    }

    try {
      const eventId = await createEvent(formData);
      navigate(`/events/${eventId}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || error || 'Failed to create event';
      setLocalError(message);
    }
  };

  const now = new Date();
  const minDateTimeLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create New Event</h1>
          <p className="text-dark-400">Plan your next game night</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-dark-800 border border-dark-700 rounded-lg p-8 space-y-6">
          {(localError || error) && (
            <ErrorAlert
              message={localError || error || ''}
              onDismiss={() => {
                setLocalError(null);
                setError(null);
              }}
            />
          )}

          <Input
            label="Event Title"
            placeholder="Friday Night Game Night"
            {...register('title')}
            error={errors.title?.message}
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Description
            </label>
            <textarea
              placeholder="Tell people about your event..."
              {...register('description')}
              className={`w-full px-4 py-3 bg-dark-700 border ${
                errors.description ? 'border-red-600' : 'border-dark-600'
              } text-dark-50 placeholder-dark-500 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition resize-none`}
              rows={5}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          <Input
            label="Location"
            placeholder="e.g. My place, 123 Gaming St"
            {...register('location')}
            error={errors.location?.message}
            disabled={isLoading}
          />

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Event Image (optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('image')}
              className="w-full cursor-pointer text-sm text-dark-50 file:font-medium file:border-0 file:bg-dark-600 file:px-4 file:py-2 file:text-dark-50 file:transition file:hover:bg-dark-500"
              disabled={isLoading}
            />
            {imageErrorMessage && (
              <p className="mt-1 text-sm text-red-400">{imageErrorMessage}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date & Time"
              type="datetime-local"
              min={minDateTimeLocal}
              {...register('date')}
              error={errors.date?.message}
              disabled={isLoading}
            />

            <Input
              label="Max Participants"
              type="number"
              min="1"
              {...register('maxParticipants')}
              error={errors.maxParticipants?.message}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              Create Event
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              size="lg"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
