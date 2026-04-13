import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BookingMetadata, BookingRequest, BookingResponse, Car, ReturnRequest, ReturnResponse } from './types';
import { fetchCars, createBooking, returnBooking } from './api';
import { calculatePrices, formatCurrency, getStartedDays } from './utils/pricing';
import './App.css';

const ADDONS = ['GPS', 'Baby seat', 'Extra driver', 'Insurance'] as const;

type AddonKey = (typeof ADDONS)[number];

function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingMetadata | null>(null);
  const [pastBookings, setPastBookings] = useState<BookingMetadata[]>([]);
  const [returnResult, setReturnResult] = useState<ReturnResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'booking' | 'return'>('booking');

  useEffect(() => {
    fetchCars()
      .then(setCars)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const initialForm = {
    personNumber: '',
    id: 0,
    timeStart: '',
    timeEnd: '',
    currentMileage: 0,
    addons: [] as AddonKey[],
  };

  const [bookingForm, setBookingForm] = useState(initialForm);
  const [returnForm, setReturnForm] = useState({ bookingNumber: 0, actualTimeEnd: '', returnMileage: 0 });

  const uniqueCars = useMemo(() => {
    const seen = new Set<string>();
    return cars.filter((car) => {
      if (seen.has(car.category)) {
        return false;
      }
      seen.add(car.category);
      return true;
    });
  }, [cars]);

  const selectedCar = useMemo(() => cars.find((car) => car.id === bookingForm.id), [cars, bookingForm.id]);

  const rentalDays = useMemo(() => getStartedDays(bookingForm.timeStart, bookingForm.timeEnd), [bookingForm.timeStart, bookingForm.timeEnd]);

  const pricingPreview = useMemo(() => {
    if (!selectedCar || !bookingData) return null;
    const mileageDiff = Math.max(0, returnForm.returnMileage - bookingData.currentMileage);
    return calculatePrices(selectedCar, getStartedDays(bookingData.timeStart, returnForm.actualTimeEnd || bookingData.timeEnd), mileageDiff, bookingData.addons, bookingData.timeEnd, returnForm.actualTimeEnd || bookingData.timeEnd);
  }, [selectedCar, bookingData, returnForm.returnMileage, returnForm.actualTimeEnd]);

  const onBookingChange = (field: string, value: string | number | AddonKey[]) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  const onReturnChange = (field: string, value: string | number) => {
    setReturnForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBookCar = (carId: number) => {
    setBookingForm((prev) => ({ ...prev, id: carId }));
    setActiveTab('booking');
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!bookingForm.personNumber || bookingForm.id === 0 || !bookingForm.timeStart || !bookingForm.timeEnd) {
      setError('Fyll i alla obligatoriska fält för bokning.');
      return;
    }
    try {
      const payload: BookingRequest = {
        ...bookingForm,
        currentMileage: Number(bookingForm.currentMileage),
      };
      const response: BookingResponse = await createBooking(payload);
      if (!response.success) {
        throw new Error(response.message);
      }
      const selected = cars.find((car) => car.id === bookingForm.id);
      if (!selected) {
        throw new Error('Vald fordonskategori finns inte.');
      }
      const metadata: BookingMetadata = {
        bookingNumber: response.bookingNumber,
        personNumber: bookingForm.personNumber,
        car: selected,
        timeStart: bookingForm.timeStart,
        timeEnd: bookingForm.timeEnd,
        currentMileage: Number(bookingForm.currentMileage),
        addons: bookingForm.addons,
      };
      setBookingData(metadata);
      setPastBookings((prev) => [metadata, ...prev]);
      setBookingForm(initialForm);
      setReturnForm({ bookingNumber: response.bookingNumber, actualTimeEnd: '', returnMileage: 0 });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReturnSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!returnForm.bookingNumber || !returnForm.actualTimeEnd) {
      setError('Välj ett bokningsnummer och ange återlämningstid.');
      return;
    }
    try {
      const payload: ReturnRequest = {
        actualTimeEnd: returnForm.actualTimeEnd,
        returnMileage: Number(returnForm.returnMileage),
      };
      const response = await returnBooking(returnForm.bookingNumber, payload);
      if (!response.success) {
        throw new Error(response.message);
      }
      setReturnResult(response);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const currentBooking = pastBookings.find((booking) => booking.bookingNumber === returnForm.bookingNumber) || null;

  if (loading) {
    return <div className="app-shell"><div className="loader">Laddar fordonsdata...</div></div>;
  }

  return (
    <div className="app-shell">
      <header className="hero-bar">
        <div>
          <p className="eyebrow">Koncernstab Digitalisering</p>
          <h1>Biluthyrning</h1>
          <p className="subtitle">Registrera bokningar och återlämningar med tydlig prisberäkning.</p>
        </div>
      </header>

      <main className="content-grid">
        <section className="card card-panel">
          <div className="tabs">
            <button className={activeTab === 'booking' ? 'tab active' : 'tab'} onClick={() => setActiveTab('booking')}>
              Bokningsregistrering
            </button>
            <button className={activeTab === 'return' ? 'tab active' : 'tab'} onClick={() => setActiveTab('return')}>
              Återlämning
            </button>
          </div>

          {error && <div className="alert">{error}</div>}

          {activeTab === 'booking' ? (
            <form className="form-grid" onSubmit={handleBookingSubmit}>
              <label>
                Personnummer
                <input
                  type="text"
                  value={bookingForm.personNumber}
                  placeholder="YYYYMMDDNNNN"
                  onChange={(event) => onBookingChange('personNumber', event.target.value)}
                />
              </label>

              <label>
                Fordonskategori
                <select value={bookingForm.id} onChange={(event) => onBookingChange('id', Number(event.target.value))}>
                  <option value={0}>Välj kategori</option>
                  {uniqueCars.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.category} — {formatCurrency(car.dayPrice)} / dag
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Uthyrning start
                <input type="datetime-local" value={bookingForm.timeStart} onChange={(event) => onBookingChange('timeStart', event.target.value)} />
              </label>

              <label>
                Planerad återlämning
                <input type="datetime-local" value={bookingForm.timeEnd} onChange={(event) => onBookingChange('timeEnd', event.target.value)} />
              </label>

              <label>
                Nuvarande mätarställning (km)
                <input type="number" min={0} value={bookingForm.currentMileage} onChange={(event) => onBookingChange('currentMileage', Number(event.target.value))} />
              </label>

              <fieldset className="addon-fieldset">
                <legend>Tilläggstjänster</legend>
                {ADDONS.map((addon) => (
                  <label key={addon} className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={bookingForm.addons.includes(addon)}
                      onChange={(event) => {
                        const selected = event.target.checked;
                        setBookingForm((prev) => ({
                          ...prev,
                          addons: selected ? [...prev.addons, addon] : prev.addons.filter((item) => item !== addon),
                        }));
                      }}
                    />
                    {addon}
                  </label>
                ))}
              </fieldset>

              <div className="form-note">
                Planerad uthyrningstid: <strong>{bookingForm.timeStart && bookingForm.timeEnd ? rentalDays : '–'}</strong> dygn.
              </div>

              <button type="submit" className="primary-button">
                Skapa bokning
              </button>

              {bookingData && (
                <div className="result-card">
                  <h2>Bokning skapad</h2>
                  <p>Nummer: <strong>{bookingData.bookingNumber}</strong></p>
                  <p>Fordonskategori: {bookingData.car.category}</p>
                </div>
              )}
            </form>
          ) : (
            <form className="form-grid" onSubmit={handleReturnSubmit}>
              <label>
                Bokningsnummer
                <select value={returnForm.bookingNumber} onChange={(event) => onReturnChange('bookingNumber', Number(event.target.value))}>
                  <option value={0}>Välj bokning</option>
                  {pastBookings.map((booking) => (
                    <option key={booking.bookingNumber} value={booking.bookingNumber}>
                      {booking.bookingNumber} — {booking.car.category}
                    </option>
                  ))}
                </select>
              </label>

              {currentBooking && (
                <div className="booking-summary">
                  <p>Planerad slut: <strong>{new Date(currentBooking.timeEnd).toLocaleString()}</strong></p>
                  <p>Start: <strong>{new Date(currentBooking.timeStart).toLocaleString()}</strong></p>
                  <p>Ursprunglig mätarställning: <strong>{currentBooking.currentMileage} km</strong></p>
                </div>
              )}

              <label>
                Återlämningstidpunkt
                <input type="datetime-local" value={returnForm.actualTimeEnd} onChange={(event) => onReturnChange('actualTimeEnd', event.target.value)} />
              </label>

              <label>
                Mätarställning vid återlämning
                <input type="number" min={0} value={returnForm.returnMileage} onChange={(event) => onReturnChange('returnMileage', Number(event.target.value))} />
              </label>

              <button type="submit" className="primary-button">
                Registrera återlämning
              </button>

              {returnResult && (
                <div className="result-card">
                  <h2>Prisberäkning</h2>
                  <div className="result-grid">
                    <label>Uthyrningstid</label><span>{returnResult.rentalTime} dygn</span>
                    <label>Körda km</label><span>{returnResult.mileageDifference} km</span>
                    <label>Grundpris</label><span>{formatCurrency(returnResult.basePrice)}</span>
                    <label>Premiumavgift</label><span>{formatCurrency(returnResult.premiumCost)}</span>
                    <label>Tillägg</label><span>{formatCurrency(returnResult.addonsCost)}</span>
                    <label>Förseningsavgift</label><span>{formatCurrency(returnResult.delayFee)}</span>
                    <label className="final-label">Totalpris</label><span className="final-value">{formatCurrency(returnResult.finalPrice)}</span>
                  </div>
                </div>
              )}
            </form>
          )}
        </section>

        <aside className="card sidebar">
          <div className="panel">
            <h2>Tillgängliga fordon</h2>
            <div className="car-list">
              {uniqueCars.map((car) => (
                <div key={car.id} className="car-card">
                  <p className="car-category">{car.category}</p>
                  <p>{formatCurrency(car.dayPrice)} / dag</p>
                  <p>{formatCurrency(car.kmPrice)} / km</p>
                  <p>Premiumavgift: {formatCurrency(car.premiumFee)}</p>
                  <button type="button" className="secondary-button" onClick={() => handleBookCar(car.id)}>
                    Boka
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel info-panel">
            <h2>Affärslogik</h2>
            <ul>
              <li>Uthyrningsdagar räknas som startade dygn.</li>
              <li>Grundpris = dagpris + km-pris.</li>
              <li>Premiumavgift multipliceras med antal dagar.</li>
              <li>Förseningsavgift tas ut vid faktisk återlämning efter planerat slut.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
