import React, { useState, useEffect, useCallback } from "react";
import { editorService } from "../services/api";
import "./EditorsPage.css";
const EditorsPage = () => {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEditors, setFilteredEditors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    headquarter: "",
    creationDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  // Charger les éditeurs
  const loadEditors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await editorService.getAll();
      setEditors(data);
    } catch (e) {
      setError("Erreur lors du chargement des éditeurs");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadEditors();
  }, [loadEditors]);
  // Filtrer les éditeurs
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEditors(editors);
    } else {
      setFilteredEditors(
        editors.filter(
          (a) =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.headquarter &&
              a.headquarter.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }
  }, [editors, searchTerm]);
  // Gérer le formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await editorService.update(editingId, form);
      } else {
        await editorService.create(form);
      }
      setForm({ name: "", headquarter: "", creationDate: "" });
      setEditingId(null);
      loadEditors();
    } catch (e) {
      setError("Erreur lors de la sauvegarde de l’éditeur");
    }
  };
  const handleEdit = (editor) => {
    setForm({
      name: editor.name,
      headquarter: editor.headquarter,
      creationDate: editor.creationDate,
    });
    setEditingId(editor.id);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet éditeur ?")) return;
    try {
      await editorService.delete(id);
      loadEditors();
    } catch (e) {
      setError("Erreur lors de la suppression");
    }
  };
  return (
    <div className="editors-page-container">
      <h2>Liste des éditeurs</h2>
      <input
        type="text"
        placeholder="Rechercher un éditeur..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <table className="editors-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Siège</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEditors.map((editor) => {
              const [year, month, day] = editor.creationDate
                .split("T")[0]
                .split("-");
              return (
                <tr key={editor.id}>
                  <td>{editor.name}</td>
                  <td>{editor.headquarter}</td>
                  <td>{`${day}/${month}/${year}`}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(editor)}
                      className="btn-edit"
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => handleDelete(editor.id)}
                      className="btn-delete"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <h3>{editingId ? "Modifier" : "Ajouter"} un éditeur</h3>
      <form onSubmit={handleSubmit} className="editor-form">
        <input
          type="text"
          name="name"
          placeholder="Nom"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="headquarter"
          placeholder="Siège"
          value={form.headquarter}
          onChange={handleChange}
        />
        <input
          type="date"
          name="creationDate"
          placeholder="Date de création"
          value={form.creationDate.split("T")[0]}
          onChange={handleChange}
        />
        <button type="submit" className="btn-save">
          {editingId ? "Enregistrer" : "Ajouter"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setForm({ name: "", headquarter: "", creationDate: "" });
              setEditingId(null);
            }}
            className="btn-cancel"
          >
            Annuler
          </button>
        )}
      </form>
    </div>
  );
};
export default EditorsPage;
