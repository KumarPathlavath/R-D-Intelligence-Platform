"""
Headless unit testing for Streamlit application using st.testing.v1.AppTest
"""

import sys
from pathlib import Path
import pytest
from streamlit.testing.v1 import AppTest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


def test_dashboard_renders_without_exceptions():
    """Verify that app.py compiles and renders without unhandled exceptions."""
    app_path = PROJECT_ROOT / "src" / "dashboard" / "app.py"
    at = AppTest.from_file(str(app_path), default_timeout=30)
    at.run()
    assert not at.exception, f"App raised unexpected exception: {at.exception}"


def test_dashboard_navigation_radio():
    """Verify that navigation radio renders all 5 options."""
    app_path = PROJECT_ROOT / "src" / "dashboard" / "app.py"
    at = AppTest.from_file(str(app_path), default_timeout=30)
    at.run()
    assert len(at.radio) > 0
    radio = at.radio[0]
    expected_options = [
        "01 | 🔭 Explore & Early Signals",
        "02 | 📊 Structured Intelligence & What's New",
        "03 | ⚡ Information Connection & Opportunities",
        "04 | 🤝 Communicate & Test Hypotheses",
        "⚙️ Operations & Engine Accuracy"
    ]
    for opt in expected_options:
        assert opt in radio.options


def test_claim_verifier_button_executes_cleanly():
    """Verify that clicking Evaluate Reliability button runs without exception."""
    app_path = PROJECT_ROOT / "src" / "dashboard" / "app.py"
    at = AppTest.from_file(str(app_path), default_timeout=30)
    at.run()
    # Find button with label "Evaluate Reliability & Extract Breakthroughs"
    eval_btns = [b for b in at.button if "Evaluate Reliability" in b.label]
    if eval_btns:
        eval_btns[0].click().run()
        assert not at.exception, f"Claim evaluator raised exception: {at.exception}"
