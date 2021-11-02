package me.schawe.multijsnake.snake;

public enum MoveRelative {
    left,
    straight,
    right;

    public Move toMove(Move lastHeadDirection) {
        switch (this) {
            case left:
                return lastHeadDirection.rLeft();
            case right:
                return lastHeadDirection.rRight();
            case straight:
                return lastHeadDirection;
        }

        // this will not happen, since the switch is exhaustive
        throw new InvalidMoveException();
    }
}
