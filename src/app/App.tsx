import './App.scss'
import { Routes, Route } from "react-router-dom"

import { AudioFilesPage } from '../pages/audioFilesPage/AudioFilesPage';
import { DocumentsPage } from '../pages/documentsPage/DocumentsPage';
import { AnalyticsPage } from '../pages/analiticsPage/AnalyticsPage';
import { SettingsPage } from '../pages/settingsPage/SettingsPage';
import { HelpPage } from '../pages/helpPage/HelpPage';
import { AudioUploadPage } from '../pages/audioUploadPage/AudioUploadPage';
import { AudioFileDetailPage } from '../pages/audioFileDetailPage/AudioFileDetailPage';
import { TextUploadPage } from '../pages/textUploadPage/TextUploadPage';
import { DocumentsDetailPage } from '../pages/documentDetailPage/DocumentDetailPage';

function App() {

  return (
    <>
      <Routes>
        <Route path='/audios' element={<AudioFilesPage/>} />
        <Route path="/audios/:id" element={<AudioFileDetailPage />} />
        <Route path='/audios/upload' element={<AudioUploadPage/>} />
        <Route path='/documents' element={<DocumentsPage/>} />
        <Route path="/documents/:id" element={<DocumentsDetailPage />} />
        <Route path='/documents/upload' element={<TextUploadPage/>} />
        <Route path='/analytics' element={<AnalyticsPage/>} />
        <Route path='/settings' element={<SettingsPage/>} />
        <Route path='/help' element={<HelpPage/>} />
      </Routes>
    </>
  )
}

export default App