// Test script to reproduce the UTG check on flop issue
// Run this in the browser console after setting up the hand

console.log('===== TEST: UTG vs BTN Flop Check Issue =====');

// Helper to wait for UI updates
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get the store
const store =
  window.zustandStore ||
  (function () {
    // Try to find the store from React DevTools
    const reactRoot =
      document.querySelector('#__next')._reactRootContainer ||
      document.querySelector('#__next')._reactInternalInstance;
    if (!reactRoot) {
      console.error('Could not find React root');
      return null;
    }
    return null; // Would need more complex logic to extract store
  })();

if (!store) {
  console.log('Store not found. Please expose it globally first by adding to your component:');
  console.log('useEffect(() => { window.zustandStore = usePokerHandStore; }, []);');
  throw new Error('Store not accessible');
}

async function testFlopCheck() {
  console.log('\n1. Initial State:');
  const initialState = store.getState();
  console.log({
    currentStreet: initialState.currentStreet,
    engineStreet: initialState.engineState?.currentState?.street,
    actionOn: initialState.engineState?.currentState?.betting?.actionOn,
    players: initialState.players.map((p) => ({ id: p.id, name: p.name, position: p.position })),
  });

  console.log('\n2. After UTG raises to $20:');
  // This would be triggered by clicking UTG and selecting RAISE with $20

  console.log('\n3. After BTN calls $20:');
  // This would be triggered by clicking BTN and selecting CALL

  console.log('\n4. After street transitions to FLOP:');
  await wait(200); // Wait for street transition

  const flopState = store.getState();
  console.log({
    currentStreet: flopState.currentStreet,
    engineStreet: flopState.engineState?.currentState?.street,
    actionOn: flopState.engineState?.currentState?.betting?.actionOn,
    currentSlot: flopState.getCurrentActionSlot(),
    validActions: await flopState.getValidActionsForCurrentPlayer(),
  });

  console.log('\n5. When UTG tries to CHECK:');
  // This is where the error occurs

  console.log('\n===== END TEST =====');
}

// Instructions for manual testing:
console.log(`
MANUAL TEST STEPS:
1. Go to /share-hand
2. Set up game: Cash, $5/$10 blinds
3. Add 2 players:
   - UTG with $100 stack
   - BTN with $100 stack
4. Go to Preflop step
5. UTG raises to $20 (click UTG, select RAISE, enter 20)
6. BTN calls (click BTN, select CALL)
7. Wait for Flop step to appear
8. Click UTG to open action dialog
9. Try to select CHECK
10. Observe console for error

Run testFlopCheck() after setup to see state details.
`);
