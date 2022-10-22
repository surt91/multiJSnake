package me.schawe.multijsnake.snake;

public enum MoveRelative {
    left,
    straight,
    right;

    public Move toMove(Move lastHeadDirection) {
        return switch (this) {
            case left -> lastHeadDirection.rLeft();
            case right -> lastHeadDirection.rRight();
            case straight -> lastHeadDirection;
        };
    }
}
