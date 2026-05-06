export default function Home() {
  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Concert Deal Finder API</h1>
      <p>Backend API for finding the best concert deals.</p>

      <h2>Available Endpoints</h2>

      <h3>GET /api/tours</h3>
      <p>Fetch tour dates for an artist</p>
      <pre>?artist=Taylor Swift&city=New York</pre>

      <h3>GET /api/travel</h3>
      <p>Get travel options (drive/fly) between two locations</p>
      <pre>?originLat=40.7128&originLon=-74.0060&destLat=34.0522&destLon=-118.2437&date=2024-06-15&originCity=New York&destCity=Los Angeles</pre>

      <h3>GET /api/hotel</h3>
      <p>Get hotel estimates for a location</p>
      <pre>?lat=34.0522&lon=-118.2437&date=2024-06-15&city=Los Angeles</pre>

      <h3>GET /api/deals</h3>
      <p>Get ranked concert deals (full orchestration)</p>
      <pre>?artist=Taylor Swift&city=New York</pre>

      <h2>Environment Variables Required</h2>
      <ul>
        <li>TICKETMASTER_API_KEY</li>
        <li>AMADEUS_CLIENT_ID</li>
        <li>AMADEUS_CLIENT_SECRET</li>
        <li>GOOGLE_MAPS_API_KEY</li>
        <li>BOOKING_API_KEY (optional)</li>
      </ul>
    </main>
  );
}
