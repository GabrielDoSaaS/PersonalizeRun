import Home from './Pages/Home';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import AdmPainel from './Pages/AdmPainel';

function App ( ) {
    return(
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={<Home/>}/>
                <Route path="/admin" element={<AdmPainel/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;