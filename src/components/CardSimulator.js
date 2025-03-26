import React, { useState, useEffect } from 'react';

const CardSimulator = () => {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  
  const initializeDeck = () => {
    const deck = {};
    suits.forEach(suit => {
      deck[suit] = [...values];
    });
    return deck;
  };
  
  const [deck, setDeck] = useState(initializeDeck());
  const [drawnCards, setDrawnCards] = useState([]);
  const [totalCards, setTotalCards] = useState(36);
  const [isSimulating, setIsSimulating] = useState(false);
  const [probabilities, setProbabilities] = useState({
    suits: {},
    values: {},
    cards: {}
  });

  // Расчет всех вероятностей
  const calculateProbabilities = () => {
    const suitCounts = {};
    const valueCounts = {};
    const cardCounts = {};
    let totalRemaining = 0;

    // Подсчет карт по мастям и значениям
    Object.entries(deck).forEach(([suit, suitValues]) => {
      suitCounts[suit] = suitValues.length;
      totalRemaining += suitValues.length;
      
      suitValues.forEach(value => {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
        cardCounts[`${suit}${value}`] = 1;
      });
    });

    // Расчет вероятностей
    const newProbabilities = {
      suits: {},
      values: {},
      cards: {}
    };

    // Вероятность масти
    Object.entries(suitCounts).forEach(([suit, count]) => {
      newProbabilities.suits[suit] = count / totalRemaining;
    });

    // Вероятность значения
    Object.entries(valueCounts).forEach(([value, count]) => {
      newProbabilities.values[value] = count / totalRemaining;
    });

    // Вероятность конкретной карты
    Object.keys(cardCounts).forEach(card => {
      const suit = card[0];
      newProbabilities.cards[card] = (1 / suitCounts[suit]) * newProbabilities.suits[suit];
    });

    setProbabilities(newProbabilities);
  };

  // Вытягивание одной карты
  const drawCard = () => {
    if (totalCards === 0) return;
    
    const availableSuits = Object.keys(deck).filter(suit => deck[suit].length > 0);
    if (availableSuits.length === 0) return;
    
    // Выбираем случайную масть
    const randomSuitIndex = Math.floor(Math.random() * availableSuits.length);
    const selectedSuit = availableSuits[randomSuitIndex];
    
    // Выбираем случайное значение из оставшихся в масти
    const availableValues = deck[selectedSuit];
    const randomValueIndex = Math.floor(Math.random() * availableValues.length);
    const selectedValue = availableValues[randomValueIndex];
    
    // Удаляем вытянутую карту из колоды
    const newDeck = { ...deck };
    newDeck[selectedSuit] = newDeck[selectedSuit].filter(val => val !== selectedValue);
    
    // Если в масти не осталось карт, удаляем масть
    if (newDeck[selectedSuit].length === 0) {
      delete newDeck[selectedSuit];
    }
    
    // Обновляем состояние
    setDeck(newDeck);
    setDrawnCards([...drawnCards, `${selectedSuit}${selectedValue}`]);
    setTotalCards(totalCards - 1);
  };
  
  // Сброс колоды
  const resetDeck = () => {
    setDeck(initializeDeck());
    setDrawnCards([]);
    setTotalCards(36);
    setProbabilities({
      suits: {},
      values: {},
      cards: {}
    });
  };
  
  // Автоматическое вытягивание карт
  useEffect(() => {
    let interval;
    if (isSimulating && totalCards > 0) {
      interval = setInterval(() => {
        drawCard();
      }, 500);
    } else if (totalCards === 0) {
      setIsSimulating(false);
    }
    
    return () => clearInterval(interval);
  }, [isSimulating, totalCards, deck, drawnCards]);
  
  // Обновляем вероятности при изменении колоды
  useEffect(() => {
    calculateProbabilities();
  }, [deck]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Симулятор вытягивания карт с вероятностями</h1>
      <p>Осталось карт: {totalCards}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={drawCard} 
          disabled={totalCards === 0}
          style={{ marginRight: '10px' }}
        >
          Вытянуть 1 карту
        </button>
        <button 
          onClick={() => setIsSimulating(!isSimulating)} 
          disabled={totalCards === 0}
          style={{ marginRight: '10px' }}
        >
          {isSimulating ? 'Остановить' : 'Автоматическое вытягивание'}
        </button>
        <button onClick={resetDeck}>
          Сбросить колоду
        </button>
      </div>
      
      {/* Секция с вероятностями */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <div style={{ width: '30%' }}>
          <h3>Вероятности мастей</h3>
          {Object.entries(probabilities.suits).map(([suit, prob]) => (
            <div key={suit} style={{ marginBottom: '5px' }}>
              <strong>{suit}:</strong> {(prob * 100).toFixed(2)}%
              <div style={{ 
                width: `${prob * 100}%`, 
                height: '10px', 
                backgroundColor: suit === '♥' || suit === '♦' ? '#ff6b6b' : '#495057',
                borderRadius: '3px',
                marginTop: '3px'
              }}></div>
            </div>
          ))}
        </div>
        
        <div style={{ width: '30%' }}>
          <h3>Вероятности значений</h3>
          {Object.entries(probabilities.values).map(([value, prob]) => (
            <div key={value} style={{ marginBottom: '5px' }}>
              <strong>{value}:</strong> {(prob * 100).toFixed(2)}%
              <div style={{ 
                width: `${prob * 100}%`, 
                height: '10px', 
                backgroundColor: '#74b9ff',
                borderRadius: '3px',
                marginTop: '3px'
              }}></div>
            </div>
          ))}
        </div>
        
        <div style={{ width: '30%' }}>
          <h3>Примеры вероятностей карт</h3>
          {Object.entries(probabilities.cards).slice(0, 5).map(([card, prob]) => (
            <div key={card} style={{ marginBottom: '5px' }}>
              <strong>{card}:</strong> {(prob * 100).toFixed(2)}%
              <div style={{ 
                width: `${prob * 100}%`, 
                height: '10px', 
                backgroundColor: '#55efc4',
                borderRadius: '3px',
                marginTop: '3px'
              }}></div>
            </div>
          ))}
          {Object.keys(probabilities.cards).length > 5 && <div>...и еще {Object.keys(probabilities.cards).length - 5} карт</div>}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '48%' }}>
          <h2>Оставшиеся карты</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {Object.keys(deck).map(suit => (
              <div key={suit} style={{ marginRight: '20px', marginBottom: '10px' }}>
                <h3>{suit} (осталось: {deck[suit].length})</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {deck[suit].map(value => (
                    <div 
                      key={`${suit}${value}`} 
                      style={{
                        margin: '2px',
                        padding: '5px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: `rgba(0, 100, 255, ${probabilities.cards[`${suit}${value}`] || 0.1})`,
                        color: probabilities.cards[`${suit}${value}`] > 0.2 ? 'white' : 'black'
                      }}
                    >
                      {suit}{value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ width: '48%' }}>
          <h2>Вытянутые карты ({drawnCards.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', maxHeight: '400px', overflowY: 'auto' }}>
            {drawnCards.map((card, index) => (
              <div 
                key={`${card}-${index}`} 
                style={{
                  margin: '2px',
                  padding: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: card[0] === '♥' || card[0] === '♦' ? '#ffebee' : '#f5f5f5'
                }}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {totalCards === 0 && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0ffe0', borderRadius: '8px' }}>
          <h3>Все карты вытянуты!</h3>
          <p>Общее количество вытянутых карт: {drawnCards.length}</p>
        </div>
      )}
    </div>
  );
};

export default CardSimulator;