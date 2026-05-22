import { useEffect, useState } from 'react'

function HeaderSearch({
    initialValue = '',
    onSubmit,
    placeholder = 'Buscar en todo el sitio...',
    className = '',
}) {
    const [term, setTerm] = useState(initialValue)

    useEffect(() => {
        setTerm(initialValue)
    }, [initialValue])

    const handleSubmit = (event) => {
        event.preventDefault()
        if (onSubmit) {
            onSubmit(term.trim())
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`w-full ${className}`} role="search">
            <div className="flex items-center gap-2">
                <input
                    type="search"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#6618a2] focus:outline-none focus:ring-2 focus:ring-[#6618a2]/20"
                    aria-label="Buscador general del sitio"
                />
                <button
                    type="submit"
                    className="rounded-md bg-[#6618a2] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#4f1280]"
                >
                    Buscar
                </button>
            </div>
        </form>
    )
}

export default HeaderSearch
