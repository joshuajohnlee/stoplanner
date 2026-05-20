import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Boffs from './Boffs.jsx'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Boffs />} />
            </Routes>
        </BrowserRouter>
    )
}
