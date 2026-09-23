import { Edit3 } from 'lucide-react';

export function EditOrderModal({ editingOrder, setEditingOrder, onSave }) {
  if (!editingOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Editar Pedido {editingOrder.id}</span>
          </h3>
          <button
            onClick={() => setEditingOrder(null)}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nome do Destinatário</label>
            <input
              type="text"
              value={editingOrder.name}
              onChange={(e) => setEditingOrder({ ...editingOrder, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">CPF / CNPJ</label>
              <input
                type="text"
                value={editingOrder.document}
                onChange={(e) => setEditingOrder({ ...editingOrder, document: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">CEP</label>
              <input
                type="text"
                value={editingOrder.postal_code}
                onChange={(e) => setEditingOrder({ ...editingOrder, postal_code: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Endereço (Rua / Logradouro)
            </label>
            <input
              type="text"
              value={editingOrder.address}
              onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Número</label>
              <input
                type="text"
                value={editingOrder.number}
                onChange={(e) => setEditingOrder({ ...editingOrder, number: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Complemento</label>
              <input
                type="text"
                value={editingOrder.complement}
                onChange={(e) => setEditingOrder({ ...editingOrder, complement: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Bairro</label>
              <input
                type="text"
                value={editingOrder.district}
                onChange={(e) => setEditingOrder({ ...editingOrder, district: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Cidade</label>
              <input
                type="text"
                value={editingOrder.city}
                onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">UF</label>
              <input
                type="text"
                maxLength={2}
                value={editingOrder.state_abbr}
                onChange={(e) =>
                  setEditingOrder({ ...editingOrder, state_abbr: e.target.value.toUpperCase() })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase text-center font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditingOrder(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
