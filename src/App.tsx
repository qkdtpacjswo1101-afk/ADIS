/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import FileUploader from './components/FileUploader';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{activeTab}</h1>
          <p className="text-slate-600">PGM 공정 품질 관리 시스템</p>
        </header>

        <section className="bg-white p-6 rounded-xl shadow-sm">
          <FileUploader onFileUploaded={(file) => console.log('File uploaded:', file.name)} />
        </section>
      </main>
    </div>
  );
}
