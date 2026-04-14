import { act, FormEvent, useEffect, useMemo, useState } from 'react';
import { BookingMetadata, BookingRequest, BookingResponse, Car, ReturnRequest, ReturnResponse, AddonKey } from './types';
import { fetchCars, createBooking, returnBooking } from './api';
import { formatCurrency } from './utils/pricing';
import './App.css';
 
const ADDONS: AddonKey[] = ['GPS', 'Baby seat', 'Extra driver', 'Insurance'];
 
function App() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pastBookings, setPastBookings] = useState<BookingMetadata[]>([]);
    const [returnResult, setReturnResult] = useState<ReturnResponse | null>(null);
    const [activeTab, setActiveTab] = useState<'booking' | 'return'>('booking');
 
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
 
    useEffect(() => {
        fetchCars()
            .then(setCars)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
  
        setReturnForm({ bookingNumber: 0, actualTimeEnd: '', returnMileage: 0 });
        setReturnResult(null);
        } , [activeTab]);
 
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
                personNumber: bookingForm.personNumber,
                id: bookingForm.id,
                timeStart: new Date(bookingForm.timeStart).toISOString(),
                timeEnd: new Date(bookingForm.timeEnd).toISOString(),
                currentMileage: Number(bookingForm.currentMileage),
                addons: bookingForm.addons,
            };
 
            const response: BookingResponse = await createBooking(payload);
 
            const selected = cars.find((car) => car.id === bookingForm.id);
            if (!selected) throw new Error('Vald fordonskategori finns inte.');
 
            setBookingForm(initialForm);
            setReturnResult(null);
            alert(`Bokning klar! Nummer: ${response.bookingNumber}`);
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
                actualTimeEnd: new Date(returnForm.actualTimeEnd).toISOString(),
                returnMileage: Number(returnForm.returnMileage),
            };
 
            const response = await returnBooking(returnForm.bookingNumber, payload);
            setReturnResult(response);
        } catch (err) {
            setError((err as Error).message);
        }
    };
 
    const currentBooking = pastBookings.find((b) => b.bookingNumber === returnForm.bookingNumber) || null;
 
    if (loading) return <div className="app-shell">Laddar data...</div>;
 
    return (
<div className="app-shell">
    <header className="hero-bar">
        <h1>Biluthyrning</h1>
    </header>

    <main className="content-grid">
        <section className="card card-panel">
            <div className="tabs">
                <button className={activeTab === 'booking' ? 'tab active' : 'tab'} onClick={() => setActiveTab('booking')}>Boka</button>
                <button className={activeTab === 'return' ? 'tab active' : 'tab'} onClick={() => setActiveTab('return')}>Återlämna</button>
            </div>

            {error && <div className="alert">{error}</div>}

            {activeTab === 'booking' ? (
                <form className="form-grid" onSubmit={handleBookingSubmit}>
                    <label>Personnummer <input type="text" value={bookingForm.personNumber} onChange={(e) => onBookingChange('personNumber', e.target.value)} /></label>
                    <label>Fordonskategori
                        <select value={bookingForm.id} onChange={(e) => onBookingChange('id', Number(e.target.value))}>
                            <option value={0}>Välj kategori</option>
                            {cars.map((car) => <option key={car.id} value={car.id}>{car.category}</option>)}
                        </select>
                    </label>
                    <label>Start <input type="datetime-local" value={bookingForm.timeStart} onChange={(e) => onBookingChange('timeStart', e.target.value)} /></label>
                    <label>Planerat slut <input type="datetime-local" value={bookingForm.timeEnd} onChange={(e) => onBookingChange('timeEnd', e.target.value)} /></label>
                    <label>Mätarställning (km) <input type="number" value={bookingForm.currentMileage} onChange={(e) => onBookingChange('currentMileage', Number(e.target.value))} /></label>
                    <button type="submit" className="primary-button">Slutför bokning</button>
                </form>
            ) : (
                <form className="form-grid" onSubmit={handleReturnSubmit}>
                    <label>Bokningsnummer <input type="text" value={returnForm.bookingNumber} onChange={(e) => onReturnChange('bookingNumber', Number(e.target.value))} /></label>
                    {currentBooking && (
                        <div className="booking-summary">
                            <p>Start: {new Date(currentBooking.timeStart).toLocaleString('sv-SE')}</p>
                            <p>Startmätare: {currentBooking.currentMileage} km</p>
                        </div>
                    )}

                    <label>Faktisk återlämning <input type="datetime-local" value={returnForm.actualTimeEnd} onChange={(e) => onReturnChange('actualTimeEnd', e.target.value)} /></label>
                    <label>Mätarställning <input type="number" value={returnForm.returnMileage} onChange={(e) => onReturnChange('returnMileage', Number(e.target.value))} /></label>
                    <button type="submit" className="primary-button return">Hämta kvitto & avsluta</button>

                    {returnResult && (
                        <div className="result-card receipt">
                            <h2>Kvitto</h2>
                            <div className="result-grid">
                                <label>Tid / Distans</label><span>{returnResult.rentalTime} dygn / {returnResult.mileageDifference} mil</span>
                                <label>Grundpris</label><span>{formatCurrency(returnResult.basePrice)}</span>
                                <label>Förseningsavgift</label><span className={returnResult.delayFee > 0 ? 'text-red' : ''}>{formatCurrency(returnResult.delayFee)}</span>
                                <label className="final-label">TOTALT</label><span className="final-value">{formatCurrency(returnResult.finalPrice)}</span>
                            </div>
                        </div>
                    )}
                </form>
            )}
        </section>

        <aside className="card sidebar">
            <h2>Fordonspark</h2>
            {cars.map((car) => (
                <div key={car.id} className="car-card">
                    <strong>{car.category}</strong>
                    <p>Dagspris: {formatCurrency(car.dayPrice)}/dag</p>
                    <p>Kilometer  tillägg: {formatCurrency(car.kmPrice)}/km</p>
                    <p>Premium tillägg: {formatCurrency(car.premiumFee)}</p>
                    <button className='primary-button' onClick={() => handleBookCar(car.id)}>Boka</button>
                </div>
            ))}
        </aside>
    </main>
</div>
    );
}
 
export default App;