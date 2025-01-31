import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Provider } from 'react-redux'
import store from './redux/store.js'
import Room from './pages/Room.jsx';



ReactDOM.createRoot(document.getElementById('root')).render(
  

  // <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>

        <Routes>

          <Route path='/' element={<App />} />
          <Route path="/room/:id" element={<Room />}/>

        </Routes>
      </BrowserRouter>
    {/* // </React.StrictMode>, */}

    </Provider>

)
