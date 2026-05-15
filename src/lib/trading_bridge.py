import sys
import json
import io
import os
from contextlib import redirect_stdout
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

def run_analysis(ticker, date, llm_provider="openai", model="gpt-4o"):
    config = DEFAULT_CONFIG.copy()
    config["llm_provider"] = llm_provider
    # Note: Using models that are available and likely to work in the environment
    config["deep_think_llm"] = model
    config["quick_think_llm"] = model

    # Use the default results directory from the framework's own config
    # but allow it to be overridden by env if needed.
    results_dir = config.get("results_dir")

    ta = TradingAgentsGraph(debug=True, config=config)

    # We want to capture stdout to stream it to the frontend
    # But we also want it to be real-time.
    # TradingAgentsGraph.propagate with debug=True prints directly.
    # We might need to monkeypatch or use a custom stream.

    class StreamToJSON(io.TextIOBase):
        def write(self, s):
            if s.strip():
                print(json.dumps({"type": "log", "content": s.strip()}), flush=True)
            return len(s)

    # Simple approach: just run it and let the parent process handle stdout
    # Or more structured:

    try:
        print(json.dumps({"type": "status", "content": f"Starting analysis for {ticker} on {date}..."}), flush=True)
        # Re-routing stdout to our JSON formatter might be tricky if pretty_print is used
        # For now, let's just run it and assume the caller captures stdout lines.
        # But wait, if I want it to be JSON, I should probably wrap the output.

        # Original propagate calls _run_graph which prints if debug is True
        final_state, decision = ta.propagate(ticker, date)

        print(json.dumps({
            "type": "result",
            "decision": decision,
            "ticker": ticker,
            "date": date,
            "final_state_path": os.path.join(results_dir, ticker, "TradingAgentsStrategy_logs", f"full_states_log_{date}.json")
        }), flush=True)

    except Exception as e:
        print(json.dumps({"type": "error", "content": str(e)}), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"type": "error", "content": "Usage: trading_bridge.py <ticker> <date> [provider] [model]"}), flush=True)
        sys.exit(1)

    ticker = sys.argv[1]
    date = sys.argv[2]
    provider = sys.argv[3] if len(sys.argv) > 3 else "openai"
    model = sys.argv[4] if len(sys.argv) > 4 else "gpt-4o"

    run_analysis(ticker, date, provider, model)
