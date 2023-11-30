async function fetchData() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=12');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon details:', error);
    }
}

async function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function init() {
    const pokemonList = await fetchData();
    await shuffleArray(pokemonList);
    renderPokemonList(pokemonList);
}

async function renderPokemonList(pokemonList) {
    const pokemonListDiv = document.getElementById('pokemonList');
    pokemonListDiv.innerHTML = '';

    for (const pokemon of pokemonList) {
        const pokemonDetails = await fetchPokemonDetails(pokemon.url);

        const pokemonDiv = document.createElement('div');
        pokemonDiv.classList.add('col-md-4', 'mb-3');

        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonDetails.id}.png`;
        pokemonDiv.innerHTML = `
            <div class="card">
                <img src="${imageUrl}" class="card-img-top" alt="${pokemonDetails.name}">
                <div class="card-body">
                    <p class="card-text">ID: ${pokemonDetails.id}</p>
                    <p class="card-text">Name: ${pokemonDetails.name}</p>
                    <p class="card-text">Height: ${pokemonDetails.height}</p>
                    <p class="card-text">Types: ${pokemonDetails.types.map(type => type.type.name).join(', ')}</p>
                    <p class="card-text">Evolutions: ${await getEvolutions(pokemonDetails.id)}</p>
                </div>
            </div>
        `;

        pokemonListDiv.appendChild(pokemonDiv);
    }
}


async function getEvolutions(pokemonId) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const data = await response.json();

        const evolutionChainUrl = data.evolution_chain.url;
        const evolutionChainResponse = await fetch(evolutionChainUrl);
        const evolutionChainData = await evolutionChainResponse.json();

        const evolutions = [];
        extractEvolutions(evolutionChainData.chain, evolutions);

        return evolutions.join(', ');
    } catch (error) {
        console.error('Error fetching evolutions:', error);
        return 'N/A';
    }
}

function extractEvolutions(chain, evolutions) {
    evolutions.push(chain.species.name);
    if (chain.evolves_to.length > 0) {
        extractEvolutions(chain.evolves_to[0], evolutions);
    }
}

async function sortBy(key) {
    const pokemonList = await fetchData();
    const sortedList = [...pokemonList].sort((a, b) => {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
    });
    renderPokemonList(sortedList);
}

init();