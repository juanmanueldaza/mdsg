#!/bin/bash
#
# MDSG Git Hooks Manager
# Manage Git hooks installation and updates
#

HOOKS_DIR="$(git rev-parse --show-toplevel)/.git/hooks"
SOURCE_DIR="$(git rev-parse --show-toplevel)/.githooks"

case "$1" in
    "install")
        echo "🔧 Installing Git hooks..."
        bash "$SOURCE_DIR/../.github/scripts/setup-hooks.sh"
        ;;
    "uninstall")
        echo "🗑️  Removing Git hooks..."
        rm -f "$HOOKS_DIR/pre-commit"
        rm -f "$HOOKS_DIR/pre-push"
        rm -f "$HOOKS_DIR/commit-msg"
        echo "✅ Git hooks removed"
        ;;
    "update")
        echo "🔄 Updating Git hooks..."
        bash "$SOURCE_DIR/../.github/scripts/setup-hooks.sh"
        ;;
    "status")
        echo "📊 Git hooks status:"
        for hook in pre-commit pre-push commit-msg; do
            if [ -x "$HOOKS_DIR/$hook" ]; then
                echo "  ✅ $hook: installed"
            else
                echo "  ❌ $hook: not installed"
            fi
        done
        ;;
    *)
        echo "MDSG Git Hooks Manager"
        echo ""
        echo "Usage: $0 {install|uninstall|update|status}"
        echo ""
        echo "Commands:"
        echo "  install    Install all Git hooks"
        echo "  uninstall  Remove all Git hooks"
        echo "  update     Update existing hooks"
        echo "  status     Show hook installation status"
        ;;
esac
