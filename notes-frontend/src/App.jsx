import React, { useEffect, useState } from 'react';
import { fetchNotes, createNote, deleteNote, updateNote } from './api';
import './styles.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch('http://localhost:8000/api/csrf/', {
          credentials: 'include',
        });

        const data = await fetchNotes();
        setNotes(data);
      } catch (error) {
        console.error('Error loading notes:', error);
        alert('Failed to fetch notes. Please make sure you are logged in.');
      }
    };

    fetchData();
  }, []);

  const handleAddOrUpdate = async () => {
    try {
      if (editingId) {
        const oldNote = notes.find(n => n.id === editingId);
        const updatedNote = {
          title,
          content,
          timestamp: oldNote?.timestamp || new Date().toISOString(),
        };
        const updated = await updateNote(editingId, updatedNote);
        setNotes(notes.map(n => (n.id === editingId ? updated : n)));
        setEditingId(null);
      } else {
        const newNote = {
          title,
          content,
          timestamp: new Date().toISOString(), // ✅ current time when adding
        };
        const created = await createNote(newNote);
        setNotes([...notes, created]);
      }
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Something went wrong while saving the note.');
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note.');
    }
  };

  const toggleDark = () => setDarkMode(!darkMode);

  return (
    <div className="app">
      <header>
        <h1>📝 Notes App</h1>
        <button onClick={toggleDark} className="toggle-btn">
          {darkMode ? '🌞 Light' : '🌙 Dark'}
        </button>
      </header>

      <div className="form">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Content"
        />
        <button onClick={handleAddOrUpdate}>
          {editingId ? 'Update Note' : 'Add Note'}
        </button>
      </div>

      <div className="notes-grid">
        {notes.map(note => (
          <div key={note.id} className="note-card" data-aos="fade-up">
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <div className="note-actions">
              <button onClick={() => handleEdit(note)}>✏️ Edit</button>
              <button onClick={() => handleDelete(note.id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
