from rocketlib import IInstanceBase

from ai.common.schema import Answer


class IInstance(IInstanceBase):
    """Forward LLM answer text to the text lane for the next prompt node."""

    def writeAnswers(self, answer: Answer) -> None:
        text = answer.getText() if hasattr(answer, "getText") else str(answer)
        text = (text or "").strip()
        if not text:
            self.preventDefault()
            return
        self.instance.writeText(text)
