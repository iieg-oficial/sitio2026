
const Searcher = ({ searchTerm, setSearchTerm }) => {
    
    return (
        <div>
            <div>
                <input 
                type="text" 
                placeholder="Buscar..."
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm} />
            </div>
        </div>
    );
}

export default Searcher;