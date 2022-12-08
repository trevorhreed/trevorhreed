const token = (type, value, lineno, colno) => {
  return { type, value, lineno, colno }
}

const CMD_START = '{%'
const CMD_END = '%}'
const OUTPUT_START = '{{'
const OUTPUT_END = '}}'
const COMMENT_START = '{#'
const COMMENT_END = '#}'

const TOKEN_CONTENT = 'content'
const TOKEN_CMD_START = 'cmd_start'
const TOKEN_CMD_END = 'cmd_end'
const TOKEN_OUTPUT_START = 'output_start'
const TOKEN_OUTPUT_END = 'output_end'
const TOKEN_COMMENT_START = 'comment_start'
const TOKEN_COMMENT_END = 'comment_end'


/*


    for
    else(for)
    endfor

    if
    elseif
    else
    endif

    extends

    block
    endblock
    super

    include

    ignore

    filter?
    macro?
    call?


    DATA => (content | DIRECTIVE)*
    DIRECTIVE => CMD_DIRECTIVE | OUTPUT_DIRECTIVE | COMMENT_DIRECTIVE
    CMD_DIRECTIVE => cmd_start CMD_STATEMENT cmd_end
    CMD_STATEMENT => EXTENDS_STATEMENT
                      | INCLUDE_STATEMENT
                      | BLOCK_STATEMENT
                      | ENDBLOCK_STATEMENT
                      | SUPER_STATEMENT
                      | FOR_STATEMENT
                      | ENDFOR_STATEMENT
                      | IF_STATEMENT
                      | ELSEIF_STATEMENT
                      | ELSE_STATEMENT
                      | ENDIF_STATEMENT
                      | IGNORE_STATEMENT
                      | ENDIGNORE_STATEMENT
    EXTENDS_STATEMENT => extends EXPR
    BLOCK_STATEMENT => block SYMBOL
    ENDBLOCK_STATEMENT => endblock
    SUPER_STATEMENT => super
    FOR_STATEMENT => for ITEM in EXPR
    ENDFOR_STATEMENT => endfor
    IF_STATEMENT => if EXPR
    ELSEIF_STATEMENT => elseif EXPR
    ELSE_STATEMENT => else
    ENDIF_STATEMENT => endif
    IGNORE_STATEMENT => ignore
    ENDIGNORE_STATEMENT => endignore
    ITEM => SYMBOL[, SYMBOL]
    SYMBOL => [a-zA-Z_][a-zA-Z_0-9]*

      Statement
        ,
        ??=
        ||=
        &&=
        %=
        /=
        *=
        **=
        -=
        +=
        =

      Expression
        ?:
        ??
        ||
        &&
        !==
        ===
        !=
        ==
        in
        >=
        >
        <=
        <
        -
        +
        + (concat ? ~)
        %
        /
        *
        **
        - (unary)
        + (unary)
        !
        ?.
        fn()
        []
        .
        ()
        variable
        literal


        or -> and -> not -> in -> is -> compare -> concat(~)? -> add -> subtract
            -> multiply -> divide -> floor divide(//)? -> mod -> pow -> unary(-,+)
            -> literal -> filter (-> filter name, -> filter args) ->

    EXPR => OR_EXPR
    OR_EXPR => AND_EXPR | OR_EXPR or OR_EXPR
    AND_EXPR => next_EXPR | AND_EXPR and AND_EXPR

    next_EXPR => <next> | <this> <this.op> <this>

    OUTPUT_DIRECTIVE => output_start EXPR output_end
    COMMENT_DIRECTIVE = comment_start comment comment_end
*/

class Parser {
  constructor({
    tags = {}
  } = {}) {
    this.source = source
    this.index = 0
    this.len = source.length
    this.lineno = 0
    this.colno = 0

    this.tags = {
      CMD_START: tags.CMD_START || CMD_START,
      CMD_END: tags.CMD_END || CMD_END,
      OUTPUT_START: tags.OUTPUT_START || OUTPUT_START,
      OUTPUT_END: tags.OUTPUT_END || OUTPUT_END,
      COMMENT_START: tags.COMMENT_START || COMMENT_START,
      COMMENT_END: tags.COMMENT_END || COMMENT_END
    }
  }

  parse(source) {

  }
}

// Utils
const isWhitespace = c => {
  return c === '\r'
    || c === '\n'
    || c === '\t'
    || c === '\f'
    || c === '\v'
    || c === '\u00a0'
    || c === '\u1680'
    || c === '\u2000'
    || c === '\u200a'
    || c === '\u2028'
    || c === '\u2029'
    || c === '\u202f'
    || c === '\u205f'
    || c === '\u3000'
    || c === '\ufeff'
}

const isNonWordChar = c => {

}

const isBinaryDigit = c => {
  return c === '0'
    || c === '1'
}

const isOctalDigit = c => {
  return c === '0'
    || c === '1'
    || c === '2'
    || c === '3'
    || c === '4'
    || c === '5'
    || c === '6'
    || c === '7'
}

const isDecimalDigit = c => {
  return c === '0'
    || c === '1'
    || c === '2'
    || c === '3'
    || c === '4'
    || c === '5'
    || c === '6'
    || c === '7'
    || c === '8'
    || c === '9'
}

const isHexDigit = c => {
  return c === '0'
    || c === '1'
    || c === '2'
    || c === '3'
    || c === '4'
    || c === '5'
    || c === '6'
    || c === '7'
    || c === '8'
    || c === '9'
    || c === 'a'
    || c === 'A'
    || c === 'b'
    || c === 'B'
    || c === 'c'
    || c === 'C'
    || c === 'd'
    || c === 'D'
    || c === 'e'
    || c === 'E'
    || c === 'f'
    || c === 'F'
}

class ExpressionParser {

  constructor({
    exclude = []
  }) { }



  seek(str, word = false) {
    let i = this.index
    while (i < this.end && !isWhitespace(this.source[i])) i++
    if (this.source.startsWith(str) && (!word || isNonWordChar(this.source[str.length]))) {
      return this.source.slice(this.index, i + str.length)
    }
    return false
  }

  peek() { return this.source[this.index] }
  peekCount(count = 1) {
    return this.source.slice(this.index, this.index + count)
  }

  consume(amount) {
    if (typeof amount === 'string') {
      this.index += str.length
    } else if (typeof amount === 'number') {
      this.index += amount
    }
  }

  parse(source) {
    this.index = 0
    this.seekIndex = 0
    this.source = source
    this.end = source.length
    this.parserIndex = 0
    while (this.index < source.length) {
      // this.parsers[this.parserIndex]()
      break
    }
  }

  parsers = [
    this.parseTernary.bind(this),
    this.parseNullishCoalescing.bind(this),
    this.parseLogicalOr.bind(this),
    this.parseLogicalAnd.bind(this),
    this.parseStrictInequality.bind(this),
    this.parseStrictEquality.bind(this),
    this.parseInequality.bind(this),
    this.parseEquality.bind(this),
    this.parseIn.bind(this),
    this.parseGreaterThanOrEqualTo.bind(this),
    this.parseGreaterThan.bind(this),
    this.parseLessThanOrEqualTo.bind(this),
    this.parseLessThan.bind(this),
    this.parseSubtraction.bind(this),
    this.parseAddition.bind(this),
    this.parseConcat.bind(this),
    this.parseRemainder.bind(this),
    this.parseDivision.bind(this),
    this.parseMultiplication.bind(this),
    this.parseExponentiation.bind(this),
    this.parsePrefixDecrement.bind(this),
    this.parsePrefixIncrement.bind(this),
    this.parseUnaryNegation.bind(this),
    this.parseUnaryPlus.bind(this),
    this.parseLogicalNot.bind(this),
    this.parsePostfixDecrement.bind(this),
    this.parsePostfixIncrement.bind(this),
    this.parseOptionalChaining.bind(this),
    this.parseFunctionCall.bind(this),
    this.parseComputedMemberAccess.bind(this),
    this.parseDotMemberAccess.bind(this),
    this.parseParentheticalGrouping.bind(this),
    this.parseIdentifier.bind(this),
    this.parseIdentifierName.bind(this),
    this.parseLiteral.bind(this),
    this.parseRegex.bind(this),
    this.parseArray.bind(this),
    this.parseObject.bind(this),
    this.parseString.bind(this),
    this.parseTemplateString.bind(this),
    this.parseNumber.bind(this),
    this.parseExponential.bind(this),
    this.parseBinaryOperator.bind(this),
    this.parseOctal.bind(this),
    this.parseHexadecimal.bind(this),
    this.parseBigInt.bind(this),
    this.parseBoolean.bind(this),
    this.parseNull.bind(this),
    this.parseUndefined.bind(this),
    this.parseHexadecimalEscape.bind(this),
    this.parseUnicodeEscape.bind(this)
  ]

  parseTernary(next, top) {
    const conditional = next()
    const questionMark = this.seek('?')
    if (!questionMark) return conditional
    this.consume(questionMark)
    const first = top()
    const colon = this.seek(':')
    if (!colon) throw new Error(`Syntax error! ${this.index}`) // TODO? Syntax error
    this.consume(colon)
    const second = top()
    return {
      type: 'ternary',
      conditional,
      first,
      second
    }
  }
  parseBinaryOperator(operator, next, top) {
    const lhs = next()
    const foundOp = this.seek(operator)
    if (!foundOp) return lhs
    this.consume(foundOp)
    const rhs = top()
    return { type: operator, lhs, rhs }
  }
  parsePrefixUnaryOperator(operator, next, top) {
    const foundOp = this.seek(operator)
    if (!foundOp) return next()
    this.consume(foundOp)
    const ohs = next()
    return { type: operator, ohs }
  }
  parsePostfixUnaryOperator(operator, next, top) {
    const ohs = next()
    const foundOp = this.seek(operator)
    if (!foundOp) return ohs
    this.consume(foundOp)
    return { type: operator, ohs }
  }
  parseNullishCoalescing(next, top) { return this.parseBinaryOperator('??', next, top) }
  parseLogicalOr(next, top) { return this.parseBinaryOperator('||', next, top) }
  parseLogicalAnd(next, top) { return this.parseBinaryOperator('&&', next, top) }
  parseStrictInequality(next, top) { return this.parseBinaryOperator('!==', next, top) }
  parseStrictEquality(next, top) { return this.parseBinaryOperator('===', next, top) }
  parseInequality(next, top) { return this.parseBinaryOperator('!=', next, top) }
  parseEquality(next, top) { return this.parseBinaryOperator('==', next, top) }
  parseIn(next, top) { return this.parseBinaryOperator('in', next, top) }
  parseGreaterThanOrEqualTo(next, top) { return this.parseBinaryOperator('>=', next, top) }
  parseGreaterThan(next, top) { return this.parseBinaryOperator('>', next, top) }
  parseLessThanOrEqualTo(next, top) { return this.parseBinaryOperator('<=', next, top) }
  parseLessThan(next, top) { return this.parseBinaryOperator('<', next, top) }
  parseSubtraction(next, top) { return this.parseBinaryOperator('-', next, top) }
  parseAddition(next, top) { return this.parseBinaryOperator('+', next, top) }
  parseConcat(next, top) { return this.parseBinaryOperator('+', next, top) }
  parseRemainder(next, top) { return this.parseBinaryOperator('%', next, top) }
  parseDivision(next, top) { return this.parseBinaryOperator('/', next, top) }
  parseMultiplication(next, top) { return this.parseBinaryOperator('*', next, top) }
  parseExponentiation(next, top) { return this.parseBinaryOperator('**', next, top) }
  parsePrefixDecrement(next, top) { return this.parsePrefixUnaryOperator('--', next, top) }
  parsePrefixIncrement(next, top) { return this.parsePrefixUnaryOperator('++', next, top) }
  parseUnaryNegation(next, top) { return this.parsePrefixUnaryOperator('-', next, top) }
  parseUnaryPlus(next, top) { return this.parsePrefixUnaryOperator('+', next, top) }
  parseLogicalNot(next, top) { return this.parsePrefixUnaryOperator('!', next, top) }
  parsePostfixDecrement(next, top) { return this.parsePostfixUnaryOperator('--', next, top) }
  parsePostfixIncrement(next, top) { return this.parsePostfixUnaryOperator('++', next, top) }
  parseOptionalChaining() { return this.parseBinaryOperator('?.', next, top) }
  parseFunctionCall() { }
  parseComputedMemberAccess() { }
  parseDotMemberAccess() { }
  parseParentheticalGrouping() { }
  parseIdentifier() { }
  parseIdentifierName() { }
  parseLiteral() { }
  parseRegex() { }
  parseArray() { }
  parseObject() { }
  parseString() { }
  parseTemplateString() { }
  parseExponential() { }
  parseBinary() { }
  parseOctal() { }
  parseHexadecimal() { }
  parseBigInt() { }
  parseNumber(next, top) {
    let value = ''
    let i = this.index
    while (isWhitespace(this.source[i])) i++
    while (isDecimalDigit(this.source[i])) value += this.source[i++]
    if (this.source[i] === '.') {
      value += '.'
      i++
      while (isDecimalDigit(this.source[i])) value += this.source[i++]
    }
    return { type: 'number', value }
  }
  parseBoolean(next, top) {
    const trueLiteral = this.seek('true', true)
    if (trueLiteral) {
      this.consume(trueLiteral)
      return { type: 'boolean', value: true }
    }
    const falseLiteral = this.seek('false', true)
    if (falseLiteral) {
      this.consume(falseLiteral)
      return { type: 'boolean', value: false }
    }
    return next()
  }
  parseNull() {
    const foundToken = this.seek('null', true)
    if (!foundToken) return next()
    this.consume(foundToken)
    return { type: 'null' }
  }
  parseUndefined(next, top) {
    const undefinedLiteral = this.seek('undefined', true)
    if (undefinedLiteral) {
      this.consume(undefinedLiteral)
      return { type: 'undefined' }
    }
    const voidLiteral = this.seek('void', true)
    if (voidLiteral) {
      const expression = top()
      return { type: 'undefined', expression }
    }
    return next()
  }
  parseHexadecimalEscape() { }
  parseUnicodeEscape() { }
  /*

    Expression
        ?:
        ??
        ||
        &&
        !==
        ===
        !=
        ==
        in
        >=
        >
        <=
        <
        -
        +
        + (concat ? ~)
        %
        /
        *
        **
        - (unary)
        + (unary)
        !
        ?.
        fn()
        []
        .
        ()
        variable
        literal

  */
}

class StatementParser {

  constructor({
    exclude = []
  } = {}) {

  }

  parse(source) {

  }

  /*
    Statement
          ;
          ,
          ??=
          ||=
          &&=
          %=
          /=
          *=
          **=
          -=
          +=
          =
  */

  parsers = [
    this.parseSemicolon.bind(this),
    this.parseComma.bind(this),
    this.parseLogicalNullishAssignment.bind(this),
    this.parseLogicalOrAssignment.bind(this),
    this.parseLogicalAndAssignment.bind(this),
    this.parseRemainderAssignment.bind(this),
    this.parseDivisionAssignment.bind(this),
    this.parseMultiplicationAssignment.bind(this),
    this.parseExponentiationAssignment.bind(this),
    this.parseSubtractionAssignment.bind(this),
    this.parseAdditionAssignment.bind(this),
    this.parseAssignment.bind(this)
  ]
  parseSemicolon() { }
  parseComma() { }
  parseLogicalNullishAssignment() { }
  parseLogicalOrAssignment() { }
  parseLogicalAndAssignment() { }
  parseRemainderAssignment() { }
  parseDivisionAssignment() { }
  parseMultiplicationAssignment() { }
  parseExponentiationAssignment() { }
  parseSubtractionAssignment() { }
  parseAdditionAssignment() { }
  parseAssignment() { }
}
