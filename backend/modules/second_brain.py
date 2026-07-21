import json
import os
from datetime import datetime, timezone

class SecondBrain:
    def __init__(self):
        self.brain_path = os.getenv(
            "SECOND_BRAIN_PATH",
            "/Volumes/JARVIS HUB3/hub3-jarvis/data/second-brain.json"
        )
        self.data = self._load()

    def _load(self):
        if os.path.exists(self.brain_path):
            with open(self.brain_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"knowledge": [], "preferences": {}, "history": []}

    def _save(self):
        os.makedirs(os.path.dirname(self.brain_path), exist_ok=True)
        with open(self.brain_path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    async def add_knowledge(self, source, content, k_type="text", user_id="admin"):
        entry = {
            "id": f"kb_{len(self.data['knowledge']) + 1}",
            "source": source,
            "content": content,
            "type": k_type,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.data["knowledge"].append(entry)
        self._save()
        return entry

    def search_sync(self, query, limit=5):
        query_lower = query.lower()
        keywords = query_lower.split()
        scored = []
        for entry in self.data["knowledge"]:
            content_lower = entry["content"].lower()
            score = sum(1 for kw in keywords if kw in content_lower)
            if score > 0:
                scored.append({**entry, "relevance_score": score})
        scored.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored[:limit]

    def get_context(self, query, limit=3):
        results = self.search_sync(query, limit)
        if not results:
            return None
        parts = [f"[{r['source']}] {r['content'][:200]}" for r in results]
        return "\n\n".join(parts)

    async def add_preference(self, key, value):
        self.data["preferences"][key] = {
            "value": value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        self._save()

    def get_preferences(self):
        return self.data.get("preferences", {})

    async def add_history(self, role, content):
        self.data["history"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        if len(self.data["history"]) > 100:
            self.data["history"] = self.data["history"][-100:]
        self._save()

    def get_history(self, limit=10):
        return self.data.get("history", [])[-limit:]

    def get_stats(self):
        return {
            "total_knowledge": len(self.data["knowledge"]),
            "total_preferences": len(self.data.get("preferences", {})),
            "total_history": len(self.data.get("history", [])),
            "brain_path": self.brain_path
        }

second_brain = SecondBrain()
