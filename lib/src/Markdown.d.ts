/**
 * Class that wraps commonmark, adding the ability to see whether
 * a given message actually uses any markdown syntax or whether
 * it's plain text.
 */
export default class Markdown {
    private input;
    private parsed;
    constructor(input: string);
    /**
     * This method is modifying the parsed AST in such a way that links are always
     * properly linkified instead of sometimes being wrongly emphasised in case
     * if you were to write a link like the example below:
     * https://my_weird-link_domain.domain.com
     * ^ this link would be parsed to something like this:
     * <a href="https://my">https://my</a><b>weird-link</b><a href="https://domain.domain.com">domain.domain.com</a>
     * This method makes it so the link gets properly modified to a version where it is
     * not emphasised until it actually ends.
     * See: https://github.com/vector-im/element-web/issues/4674
     * @param parsed
     */
    private repairLinks;
    isPlainText(): boolean;
    toHTML({ externalLinks }?: {
        externalLinks?: boolean;
    }): string;
    toPlaintext(): string;
}
