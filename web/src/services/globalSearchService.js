import api from '@services/apiService'

const normalizeText = (value) => (value ?? '').toString().toLowerCase().trim()

export const searchSiteContent = async (searchTerm) => {
    const query = normalizeText(searchTerm)

    if (!query || query.length < 2) {
        return []
    }

    const response = await api.get('/search', {
        params: {
            q: query,
            limit: 80,
            per_source: 40,
        },
    })

    return response.data?.results ?? []
}
