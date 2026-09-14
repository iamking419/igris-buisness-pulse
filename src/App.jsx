import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Survey from './pages/Survey'
import ThankYou from './pages/ThankYou'
import Admin from './pages/Admin'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/survey" element={<Survey/>} />
      <Route path="/thank-you" element={<ThankYou/>} />
      <Route path="/admin" element={<Admin/>} />
    </Routes>
  )
}
