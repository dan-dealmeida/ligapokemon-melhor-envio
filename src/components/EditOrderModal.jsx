import { Edit3 } from 'lucide-react';

export function EditOrderModal({ editingOrder, setEditingOrder, onSave }) {
  if (!editingOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-red-900/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-red-950/30 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-red-500" />
            <span>Editar Pedido {editingOrder.id}</span>
          </h3>
          <button
            onClick={() => setEditingOrder(null)}
            className="text-zinc-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Nome do Destinatário</label>
            <input
              type="text"
              value={editingOrder.name}
              onChange={(e) => setEditingOrder({ ...editingOrder, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">CPF / CNPJ</label>
              <input
                type="text"
                value={editingOrder.document}
                onChange={(e) => setEditingOrder({ ...editingOrder, document: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">CEP</label>
              <input
                type="text"
                value={editingOrder.postal_code}
                onChange={(e) => setEditingOrder({ ...editingOrder, postal_code: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Endereço (Rua / Logradouro)
            </label>
            <input
              type="text"
              value={editingOrder.address}
              onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Número</label>
              <input
                type="text"
                value={editingOrder.number}
                onChange={(e) => setEditingOrder({ ...editingOrder, number: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Complemento</label>
              <input
                type="text"
                value={editingOrder.complement}
                onChange={(e) => setEditingOrder({ ...editingOrder, complement: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Bairro</label>
              <input
                type="text"
                value={editingOrder.district}
                onChange={(e) => setEditingOrder({ ...editingOrder, district: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Cidade</label>
              <input
                type="text"
                value={editingOrder.city}
                onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-medium mb-1">UF</label>
              <input
                type="text"
                maxLength={2}
                value={editingOrder.state_abbr}
                onChange={(e) =>
                  setEditingOrder({ ...editingOrder, state_abbr: e.target.value.toUpperCase() })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white uppercase text-center font-mono focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditingOrder(null)}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold transition shadow-lg shadow-red-600/25"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
