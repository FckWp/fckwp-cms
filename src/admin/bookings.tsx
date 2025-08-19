import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration: number; // minutes
}

interface Booking {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  serviceId: string;
}

const initialServices: Service[] = [
  { id: 'svc1', name: 'Consultation', duration: 60 },
  { id: 'svc2', name: 'Therapy Session', duration: 90 },
];

const initialBookings: Booking[] = [
  { id: 'b1', date: '2025-01-10', time: '10:00', serviceId: 'svc1' },
  { id: 'b2', date: '2025-01-15', time: '14:00', serviceId: 'svc2' },
];

export default function AdminBookings() {
  const { t, i18n } = useTranslation();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [bookings] = useState<Booking[]>(initialBookings);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00' });
  const [newService, setNewService] = useState({ name: '', duration: 30 });

  const addService = () => {
    if (!newService.name) return;
    setServices([
      ...services,
      { id: Math.random().toString(36).slice(2), name: newService.name, duration: newService.duration },
    ]);
    setNewService({ name: '', duration: 30 });
  };

  // Calendar generation
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    new Date(2021, 7, i).toLocaleDateString(i18n.language, { weekday: 'short' })
  );

  const blankDays = Array.from({ length: firstDay.getDay() });
  const calendarDays = Array.from({ length: daysInMonth }).map((_, i) => new Date(year, month, i + 1));

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('bookings.workingHours')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <Input
            type="time"
            value={workingHours.start}
            onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
          />
          <span>-</span>
          <Input
            type="time"
            value={workingHours.end}
            onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('bookings.services')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder={t('bookings.serviceName') ?? ''}
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder={t('bookings.duration') ?? ''}
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
            />
            <Button onClick={addService} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('bookings.serviceName')}</TableHead>
                <TableHead>{t('bookings.duration')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('bookings.calendar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-center font-medium mb-2">
            {weekDays.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {blankDays.map((_, i) => (
              <div key={`b${i}`} />
            ))}
            {calendarDays.map((date) => {
              const dateStr = date.toISOString().slice(0, 10);
              const dayBookings = bookings.filter((b) => b.date === dateStr);
              return (
                <div key={dateStr} className="border rounded p-1 h-24 text-left">
                  <div className="text-xs font-bold">{date.getDate()}</div>
                  {dayBookings.map((b) => {
                    const service = services.find((s) => s.id === b.serviceId);
                    return (
                      <div key={b.id} className="text-[10px] truncate">
                        {b.time} {service?.name}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

