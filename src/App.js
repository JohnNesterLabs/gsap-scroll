import './App.css';
import PinnedFrameSequence from './PinnedFrameSequence';

function App() {
  return (
    <div className="App">
      <section className="section section-one">
        <h2>First Section</h2>
        <p>This is the first line of text in the first section.</p>
        <p>This is the second line of text in the first section.</p>
      </section>

      <section className="section section-three">
        <h2>Third Section</h2>
        <p>This is the first line of text in the third section.</p>
        <p>This is the second line of text in the third section.</p>
      </section>

      <PinnedFrameSequence />
    </div>
  );
}

export default App;
